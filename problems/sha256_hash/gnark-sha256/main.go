package main

import (
	"bytes"
	"crypto/sha256"
	"encoding/binary"
	"flag"
	"fmt"
	"hash"
	"io"
	"os"

	ipc "github.com/PolyhedraZK/proof-arena/SPJ/IPCUtils"
	"github.com/consensys/gnark-crypto/ecc"
	"github.com/consensys/gnark-crypto/kzg"
	"github.com/consensys/gnark/backend/plonk"
	"github.com/consensys/gnark/backend/witness"
	"github.com/consensys/gnark/constraint"
	"github.com/consensys/gnark/frontend"
	"github.com/consensys/gnark/frontend/cs/scs"
	zkhash "github.com/consensys/gnark/std/hash"
	gnarksha2 "github.com/consensys/gnark/std/hash/sha2"
	"github.com/consensys/gnark/std/math/uints"
)

const (
	N           = 4
	HasherName  = "SHA-256"
	InputSize   = 64
	OutputSize  = 32
	CircuitFile = "circuit"
)

type testCase struct {
	zk     func(api frontend.API) (zkhash.BinaryFixedLengthHasher, error)
	native func() hash.Hash
}

var testCases = map[string]testCase{
	HasherName: {gnarksha2.New, sha256.New},
}

type sha256Circuit struct {
	In       []uints.U8
	Expected []uints.U8 `gnark:",public"`
	hasher   string
}

func (c *sha256Circuit) Define(api frontend.API) error {
	for i := 0; i < N; i++ {
		if err := Hash(c.In[i*InputSize:(i+1)*InputSize], c.Expected[i*OutputSize:(i+1)*OutputSize], c, api); err != nil {
			return err
		}
	}
	return nil
}

func Hash(in []uints.U8, expected []uints.U8, c *sha256Circuit, api frontend.API) error {
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

func writeCircuitToFile(filename string, r1cs constraint.ConstraintSystem, pk plonk.ProvingKey, vk plonk.VerifyingKey) error {
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

func proverSetup() (cs constraint.ConstraintSystem, pk plonk.ProvingKey, vk plonk.VerifyingKey, err error) {
    // Initialize the circuit
    var c sha256Circuit
    c.In = make([]uints.U8, N*InputSize)
    c.Expected = make([]uints.U8, N*OutputSize)
    c.hasher = HasherName
    r1cs, err := frontend.Compile(ecc.BN254.ScalarField(), scs.NewBuilder, &c)
    if err != nil {
        return nil, nil, nil, err
    }
    sizeCanonical, _ := plonk.SRSSize(r1cs)
    srs := kzg.NewSRS(ecc.BN254)
    if srs == nil || sizeCanonical <= 0 {
        return nil, nil, nil, fmt.Errorf("invalid SRS size: required %d", sizeCanonical)
    }
    pk, vk, err = plonk.Setup(r1cs, srs, srs)
    if err != nil {
        return nil, nil, nil, fmt.Errorf("failed to setup plonk: %w", err)
    }

    return r1cs, pk, vk, nil
}

func prove(inputPipe *os.File, outputPipe *os.File) error {
	cs, pk, vk, err := proverSetup()
	if err != nil {
		return err
	}
	ipc.Write_uint64(outputPipe, uint64(N))

	in, err := ipc.Read_byte_array(inputPipe)
	if err != nil {
		return err
	}
	expectedBytes := calculateExpectedOutput(in)
	ipc.Write_byte_array(outputPipe, expectedBytes)

	witness, err := generateWitness(in, expectedBytes)
	if err != nil {
		return err
	}
	ipc.Write_string(outputPipe, "witness generated")

	proof, err := plonk.Prove(cs, pk, witness)
	if err != nil {
		return err
	}

	return sendProofData(proof, vk, witness, outputPipe)
}

func calculateExpectedOutput(in []byte) []byte {
	expectedBytes := make([]byte, N*OutputSize)
	for i := 0; i < N; i++ {
		h := sha256.New()
		h.Write(in[i*InputSize : (i+1)*InputSize])
		copy(expectedBytes[i*OutputSize:(i+1)*OutputSize], h.Sum(nil))
	}
	return expectedBytes
}

func generateWitness(in, expectedBytes []byte) (witness.Witness, error) {
	var c sha256Circuit
	c.In = uints.NewU8Array(in)
	c.Expected = uints.NewU8Array(expectedBytes)
	c.hasher = HasherName
	return frontend.NewWitness(&c, ecc.BN254.ScalarField())
}

func sendProofData(proof plonk.Proof, vk plonk.VerifyingKey, witness witness.Witness, outputPipe *os.File) error {
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
	proofBytes, err := ipc.Read_byte_array(inputPipe)
	if err != nil {
		return err
	}
	vkBytes, err := ipc.Read_byte_array(inputPipe)
	if err != nil {
		return err
	}
	publicWitnessBytes, err := ipc.Read_byte_array(inputPipe)
	if err != nil {
		return err
	}

	vk := plonk.NewVerifyingKey(ecc.BN254)
	proof := plonk.NewProof(ecc.BN254)
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

	numRepeats := 100
	for i := 0; i < numRepeats; i++ {
		err = plonk.Verify(proof, vk, publicWitness)
	}
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		ipc.Write_byte_array(outputPipe, []byte{0})
		repeatByte := make([]byte, 8)
		binary.LittleEndian.PutUint64(repeatByte, uint64(numRepeats))
		ipc.Write_byte_array(outputPipe, repeatByte)
	} else {
		fmt.Fprintf(os.Stderr, "Proof verified\n")
		ipc.Write_byte_array(outputPipe, []byte{0xff})
		repeatByte := make([]byte, 8)
		binary.LittleEndian.PutUint64(repeatByte, uint64(numRepeats))
		ipc.Write_byte_array(outputPipe, repeatByte)
	}
	fmt.Fprintf(os.Stderr, "Done\n")
	return nil
}

func main() {
	mode := flag.String("mode", "prove", "prove or verify")
	pipeToProver := flag.String("toMe", "", "pipe to prover")
	pipeToSPJ := flag.String("toSPJ", "", "pipe to SPJ")
	flag.Parse()

	spjToProverPipeName := *pipeToProver
	spjToProverPipe, err := os.OpenFile(spjToProverPipeName, os.O_RDONLY, os.ModeNamedPipe)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
	defer spjToProverPipe.Close()

	ProverToSPJPipeName := *pipeToSPJ
	ProverToSPJPipe, err := os.OpenFile(ProverToSPJPipeName, os.O_WRONLY, os.ModeNamedPipe)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
	defer ProverToSPJPipe.Close()

	switch *mode {
	case "prove":

		ipc.Write_string(ProverToSPJPipe, "GNARK SHA-256")
		ipc.Write_string(ProverToSPJPipe, "PLONK")
		ipc.Write_string(ProverToSPJPipe, "GNARK")
		err = prove(spjToProverPipe, ProverToSPJPipe)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error: %v\n", err)
			os.Exit(1)
		}
	case "verify":
		err = verify(spjToProverPipe, ProverToSPJPipe)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error: %v\n", err)
			os.Exit(1)
		}
	default:
		err = fmt.Errorf("invalid mode: %s", *mode)
	}

	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}
