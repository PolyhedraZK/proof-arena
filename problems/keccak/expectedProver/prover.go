package main

import (
	"bytes"
	"flag"
	"fmt"
	"hash"
	"io"
	"os"

	ipc "github.com/PolyhedraZK/proof-arena/problems/IPCUtils"
	"github.com/consensys/gnark-crypto/ecc"
	"github.com/consensys/gnark/backend/groth16"
	"github.com/consensys/gnark/backend/witness"
	"github.com/consensys/gnark/constraint"
	"github.com/consensys/gnark/frontend"
	"github.com/consensys/gnark/frontend/cs/r1cs"
	zkhash "github.com/consensys/gnark/std/hash"
	gnarksha3 "github.com/consensys/gnark/std/hash/sha3"
	"github.com/consensys/gnark/std/math/uints"
	"golang.org/x/crypto/sha3"
)

const (
	N           = 4
	HasherName  = "Keccak-256"
	InputSize   = 64
	OutputSize  = 32
	CircuitFile = "circuit"
)

type testCase struct {
	zk     func(api frontend.API) (zkhash.BinaryHasher, error)
	native func() hash.Hash
}

var testCases = map[string]testCase{
	HasherName: {gnarksha3.NewLegacyKeccak256, sha3.NewLegacyKeccak256},
}

type sha3Circuit struct {
	In       []uints.U8
	Expected []uints.U8 `gnark:",public"`
	hasher   string
}

func (c *sha3Circuit) Define(api frontend.API) error {
	for i := 0; i < N; i++ {
		if err := Hash(c.In[i*InputSize:(i+1)*InputSize], c.Expected[i*OutputSize:(i+1)*OutputSize], c, api); err != nil {
			return err
		}
	}
	return nil
}

func Hash(in []uints.U8, expected []uints.U8, c *sha3Circuit, api frontend.API) error {
	newHasher, ok := testCases[c.hasher]
	if !ok {
		return fmt.Errorf("hash function unknown: %s", c.hasher)
	}
	h, err := newHasher.zk(api)
	if err != nil {
		return err
	}
	uapi, err := uints.New[uints.U64](api)
	if err != nil {
		return err
	}

	h.Write(in)
	res := h.Sum()

	for i := range expected {
		uapi.ByteAssertEq(expected[i], res[i])
	}
	return nil
}

func compile() error {
	var c sha3Circuit
	c.In = make([]uints.U8, N*InputSize)
	c.Expected = make([]uints.U8, N*OutputSize)
	c.hasher = HasherName

	r1cs, err := frontend.Compile(ecc.BN254.ScalarField(), r1cs.NewBuilder, &c)
	if err != nil {
		return err
	}

	pk, vk, err := groth16.Setup(r1cs)
	if err != nil {
		return err
	}

	return writeCircuitToFile(CircuitFile, r1cs, pk, vk)
}

func writeCircuitToFile(filename string, r1cs constraint.ConstraintSystem, pk groth16.ProvingKey, vk groth16.VerifyingKey) error {
	circuitFile, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer circuitFile.Close()

	writeByteArray := func(data interface {
		WriteTo(w io.Writer) (int64, error)
	}) error {
		buffer := bytes.NewBuffer(nil)
		if _, err := data.WriteTo(buffer); err != nil {
			return err
		}
		return ipc.Write_byte_array(circuitFile, buffer.Bytes())
	}

	if err := writeByteArray(r1cs); err != nil {
		return err
	}
	if err := writeByteArray(pk); err != nil {
		return err
	}
	if err := writeByteArray(vk); err != nil {
		return err
	}

	return nil
}

func prove(inputPipe *os.File, outputPipe *os.File) error {
	combinedBytes := ipc.Read_byte_array(inputPipe)
	// split the bytes into r1cs, pk, and vk
	byteReader := bytes.NewReader(combinedBytes)
	r1csBytes := ipc.Read_byte_array(byteReader)
	pkBytes := ipc.Read_byte_array(byteReader)
	vkBytes := ipc.Read_byte_array(byteReader)

	cs := groth16.NewCS(ecc.BN254)
	pk := groth16.NewProvingKey(ecc.BN254)
	vk := groth16.NewVerifyingKey(ecc.BN254)

	if _, err := cs.ReadFrom(bytes.NewReader(r1csBytes)); err != nil {
		return err
	}
	if _, err := pk.ReadFrom(bytes.NewReader(pkBytes)); err != nil {
		return err
	}
	if _, err := vk.ReadFrom(bytes.NewReader(vkBytes)); err != nil {
		return err
	}
	ipc.Write_uint64(outputPipe, uint64(N))
	ipc.Write_string(outputPipe, "setup finished")

	in := ipc.Read_byte_array(inputPipe)

	expectedBytes := calculateExpectedOutput(in)
	ipc.Write_byte_array(outputPipe, expectedBytes)

	witness, err := generateWitness(in, expectedBytes)
	if err != nil {
		return err
	}
	ipc.Write_string(outputPipe, "witness generated")

	proof, err := groth16.Prove(cs, pk, witness)
	if err != nil {
		return err
	}

	return sendProofData(proof, vk, witness, outputPipe)
}

func calculateExpectedOutput(in []byte) []byte {
	expectedBytes := make([]byte, N*OutputSize)
	for i := 0; i < N; i++ {
		h := sha3.NewLegacyKeccak256()
		h.Write(in[i*InputSize : (i+1)*InputSize])
		copy(expectedBytes[i*OutputSize:(i+1)*OutputSize], h.Sum(nil))
	}
	return expectedBytes
}

func generateWitness(in, expectedBytes []byte) (witness.Witness, error) {
	var c sha3Circuit
	c.In = uints.NewU8Array(in)
	c.Expected = uints.NewU8Array(expectedBytes)
	c.hasher = HasherName
	return frontend.NewWitness(&c, ecc.BN254.ScalarField())
}

func sendProofData(proof groth16.Proof, vk groth16.VerifyingKey, witness witness.Witness, outputPipe *os.File) error {
	writeBuffer := func(data interface {
		WriteTo(w io.Writer) (int64, error)
	}) error {
		buffer := bytes.NewBuffer(nil)
		if _, err := data.WriteTo(buffer); err != nil {
			return err
		}
		return ipc.Write_byte_array(outputPipe, buffer.Bytes())
	}

	if err := writeBuffer(proof); err != nil {
		return err
	}
	if err := writeBuffer(vk); err != nil {
		return err
	}

	publicWitness, err := witness.Public()
	if err != nil {
		return err
	}
	return writeBuffer(publicWitness)
}

func verify(inputPipe *os.File, outputPipe *os.File) error {
	proofBytes := ipc.Read_byte_array(inputPipe)
	vkBytes := ipc.Read_byte_array(inputPipe)
	publicWitnessBytes := ipc.Read_byte_array(inputPipe)

	vk := groth16.NewVerifyingKey(ecc.BN254)
	proof := groth16.NewProof(ecc.BN254)
	publicWitness, err := frontend.NewWitness(nil, ecc.BN254.ScalarField(), frontend.PublicOnly())
	if err != nil {
		return err
	}

	if _, err := vk.ReadFrom(bytes.NewReader(vkBytes)); err != nil {
		return err
	}
	if _, err := proof.ReadFrom(bytes.NewReader(proofBytes)); err != nil {
		return err
	}
	if _, err := publicWitness.ReadFrom(bytes.NewReader(publicWitnessBytes)); err != nil {
		return err
	}

	err = groth16.Verify(proof, vk, publicWitness)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		ipc.Write_byte_array(outputPipe, []byte{0})
	} else {
		fmt.Fprintf(os.Stderr, "Proof verified\n")
		ipc.Write_byte_array(outputPipe, []byte{0xff})
	}
	fmt.Fprintf(os.Stderr, "Done\n")
	return nil
}

func main() {
	mode := flag.String("mode", "prove", "compile or prove or verify")
	flag.Parse()

	// open a named pipe to avoid blocking on stdin
	// read pipe name from stdin
	spjToProverPipeName := ipc.Read_string(os.Stdin)
	spjToProverPipe, err := os.OpenFile(spjToProverPipeName, os.O_RDONLY, os.ModeNamedPipe)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
	defer spjToProverPipe.Close()

	ProverToSPJPipeName := ipc.Read_string(os.Stdin)
	ProverToSPJPipe, err := os.OpenFile(ProverToSPJPipeName, os.O_WRONLY, os.ModeNamedPipe)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
	defer ProverToSPJPipe.Close()

	switch *mode {
	case "compile":
		err = compile()
	case "prove":
		// send the prover name, algorithm name, and proof system name
		ipc.Write_string(ProverToSPJPipe, "GNARK KECCAK-256")
		ipc.Write_string(ProverToSPJPipe, "Groth16")
		ipc.Write_string(ProverToSPJPipe, "GNARK")
		err = prove(spjToProverPipe, ProverToSPJPipe)
	case "verify":
		err = verify(spjToProverPipe, ProverToSPJPipe)
	default:
		err = fmt.Errorf("invalid mode: %s", *mode)
	}

	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}
