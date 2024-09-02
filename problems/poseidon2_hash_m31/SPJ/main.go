package main

import (
	"crypto/rand"
	"fmt"

	"github.com/PolyhedraZK/proof-arena/SPJ"
)

type PoseidonM31SPJ struct{}

func (k *PoseidonM31SPJ) GenerateTestData(n uint64) []byte {
	data := make([]byte, n*64) // 64 bytes per instance
	_, err := rand.Read(data)
	if err != nil {
		panic(fmt.Sprintf("Failed to generate random data: %v", err))
	}
	return data
}

func (k *PoseidonM31SPJ) VerifyResults(testData, results []byte) bool {
	// skip verification for now

	// n := uint64(len(testData) / 64)
	// if uint64(len(results)) != n*32 {
	// 	return false
	// }

	// for i := uint64(0); i < n; i++ {
	// 	input := testData[i*64 : (i+1)*64]
	// 	expectedOutput := results[i*32 : (i+1)*32]

	// 	h := sha3.NewLegacyKeccak256()
	// 	h.Write(input)
	// 	computedOutput := h.Sum(nil)

	// 	if !bytes.Equal(computedOutput, expectedOutput) {
	// 		return false
	// 	}
	// }

	return true
}

func (k *PoseidonM31SPJ) GetProblemID() int {
	return 4
}

func main() {
	panicoseidonM31SPJ := &PoseidonM31SPJ{}
	spj, err := SPJ.NewSPJTemplate(panicoseidonM31SPJ)
	if err != nil {
		panic(fmt.Sprintf("Failed to create SPJ template: %v", err))
	}
	err = spj.Run()
	if err != nil {
		panic(fmt.Sprintf("SPJ run failed: %v", err))
	}
}
