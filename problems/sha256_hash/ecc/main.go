package main

import (
	"bytes"
	"encoding/binary"
	"flag"
	"fmt"
	"io"
	"os"

	ipc "github.com/PolyhedraZK/proof-arena/SPJ/IPCUtils"
	"github.com/consensys/gnark-crypto/ecc"
	"github.com/consensys/gnark/backend/groth16"
	"github.com/consensys/gnark/backend/witness"
	"github.com/consensys/gnark/constraint"
	"github.com/consensys/gnark/frontend"
	"github.com/consensys/gnark/frontend/cs/r1cs"
)

// Ch function: (x AND y) XOR (NOT x AND z)
func Ch(api frontend.API, x, y, z frontend.Variable) frontend.Variable {
	return api.Xor(api.And(x, y), api.And(api.Xor(x, 1), z))
}

// Maj function: (x AND y) XOR (x AND z) XOR (y AND z)
func Maj(api frontend.API, x, y, z frontend.Variable) frontend.Variable {
	return api.Xor(api.Xor(api.And(x, y), api.And(x, z)), api.And(y, z))
}

// ROTR function: Circular right shift
func ROTR(api frontend.API, x frontend.Variable, n int, bitSize int) frontend.Variable {
	// Perform a right shift and wrap around
	return api.Or(api.Shift(x, bitSize-n), api.Shift(x, -n))
}

// Sigma0 function: ROTR(x, 2) XOR ROTR(x, 13) XOR ROTR(x, 22)
func Sigma0(api frontend.API, x frontend.Variable) frontend.Variable {
	return api.Xor(api.Xor(ROTR(api, x, 2, 32), ROTR(api, x, 13, 32)), ROTR(api, x, 22, 32))
}

// Sigma1 function: ROTR(x, 6) XOR ROTR(x, 11) XOR ROTR(x, 25)
func Sigma1(api frontend.API, x frontend.Variable) frontend.Variable {
	return api.Xor(api.Xor(ROTR(api, x, 6, 32), ROTR(api, x, 11, 32)), ROTR(api, x, 25, 32))
}

type SHA256Circuit struct {
	Input  [512]frontend.Variable `gnark:",public"` // 输入是512位
	Output [256]frontend.Variable `gnark:",public"` // 输出是256位
}

func (circuit *SHA256Circuit) Define(api frontend.API) error {
	// 初始化哈希值
	h := [8]frontend.Variable{
		0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
		0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
	}

	// 常量 K
	k := []frontend.Variable{
		0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, // 前面一部分常量
		// 继续填充其他常量
	}

	// 消息调度
	w := make([]frontend.Variable, 64)
	for i := 0; i < 16; i++ {
		w[i] = api.FromBinary(circuit.Input[i*32 : (i+1)*32]...)
	}
	for i := 16; i < 64; i++ {
		s0 := api.Xor(api.Xor(ROTR(api, w[i-15], 7, 32), ROTR(api, w[i-15], 18, 32)), api.Shift(w[i-15], -3))
		s1 := api.Xor(api.Xor(ROTR(api, w[i-2], 17, 32), ROTR(api, w[i-2], 19, 32)), api.Shift(w[i-2], -10))
		w[i] = api.Add(api.Add(w[i-16], s0), api.Add(w[i-7], s1))
	}

	// 主压缩循环
	for i := 0; i < 64; i++ {
		s1 := Sigma1(api, h[4])
		ch := Ch(api, h[4], h[5], h[6])
		temp1 := api.Add(api.Add(api.Add(h[7], s1), api.Add(ch, k[i])), w[i])
		s0 := Sigma0(api, h[0])
		maj := Maj(api, h[0], h[1], h[2])
		temp2 := api.Add(s0, maj)

		h[7] = h[6]
		h[6] = h[5]
		h[5] = h[4]
		h[4] = api.Add(h[3], temp1)
		h[3] = h[2]
		h[2] = h[1]
		h[1] = h[0]
		h[0] = api.Add(temp1, temp2)
	}

	// 将最终哈希值合并并约束为输出
	for i := 0; i < 8; i++ {
		outputBits := api.ToBinary(h[i], 32)
		for j := 0; j < 32; j++ {
			api.AssertIsEqual(circuit.Output[i*32+j], outputBits[j])
		}
	}

	return nil
}

const (
	N           = 1024
	CircuitFile = "circuit"
)

type XorCircuit struct {
	A []frontend.Variable
	B []frontend.Variable
	C []frontend.Variable
}

func (c *XorCircuit) Define(api frontend.API) error {
	for i := 0; i < len(c.A); i++ {
		api.AssertIsEqual(c.C[i], api.Xor(c.A[i], c.B[i]))
	}
	return nil
}

func proverSetup() (cs constraint.ConstraintSystem, pk groth16.ProvingKey, vk groth16.VerifyingKey, err error) {
	var c XorCircuit
	c.A = make([]frontend.Variable, N)
	c.B = make([]frontend.Variable, N)
	c.C = make([]frontend.Variable, N)

	r1cs, err := frontend.Compile(ecc.BN254.ScalarField(), r1cs.NewBuilder, &c)
	if err != nil {
		return nil, nil, nil, err
	}

	pk, vk, err = groth16.Setup(r1cs)
	if err != nil {
		return nil, nil, nil, err
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

	proof, err := groth16.Prove(cs, pk, witness)
	if err != nil {
		return err
	}

	return sendProofData(proof, vk, witness, outputPipe)
}

func calculateExpectedOutput(in []byte) []byte {
	expectedBytes := make([]byte, N)
	for i := 0; i < N; i++ {
		expectedBytes[i] = in[i] ^ in[i+N]
	}
	return expectedBytes
}

func generateWitness(in, expectedBytes []byte) (witness.Witness, error) {
	var c XorCircuit
	c.A = make([]frontend.Variable, N)
	c.B = make([]frontend.Variable, N)
	c.C = make([]frontend.Variable, N)
	for i := 0; i < N; i++ {
		c.A[i] = in[i]
		c.B[i] = in[i+N]
		c.C[i] = expectedBytes[i]
	}
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
	numRepeats := 10000
	for i := 0; i < numRepeats; i++ {
		err = groth16.Verify(proof, vk, publicWitness)
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
	toprover := flag.String("toMe", "", "pipe name to prover")
	tospj := flag.String("toSPJ", "", "pipe name to SPJ")
	flag.Parse()

	// open a named pipe to avoid blocking on stdin
	// read pipe name from stdin
	spjToProverPipeName := *toprover
	spjToProverPipe, err := os.OpenFile(spjToProverPipeName, os.O_RDONLY, os.ModeNamedPipe)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
	defer spjToProverPipe.Close()

	ProverToSPJPipeName := *tospj
	ProverToSPJPipe, err := os.OpenFile(ProverToSPJPipeName, os.O_WRONLY, os.ModeNamedPipe)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
	defer ProverToSPJPipe.Close()

	switch *mode {
	case "prove":
		// send the prover name, algorithm name, and proof system name
		ipc.Write_string(ProverToSPJPipe, "GNARK_A_Xor_B")
		ipc.Write_string(ProverToSPJPipe, "Groth16")
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
