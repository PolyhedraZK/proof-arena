package main

import (
	"bytes"
	"crypto/rand"
	"fmt"

	"github.com/PolyhedraZK/proof-arena/SPJ"
	"golang.org/x/crypto/sha3"
)

type KeccakSPJ struct{}

func (k *KeccakSPJ) GenerateTestData(n uint64) []byte {
	data := make([]byte, n*64) // 64 bytes per instance
	_, err := rand.Read(data)
	if err != nil {
		panic(fmt.Sprintf("Failed to generate random data: %v", err))
	}
	return data
}

func (k *KeccakSPJ) VerifyResults(testData, results []byte) bool {
	n := uint64(len(testData) / 64)
	if uint64(len(results)) != n*32 {
		return false
	}

	for i := uint64(0); i < n; i++ {
		input := testData[i*64 : (i+1)*64]
		expectedOutput := results[i*32 : (i+1)*32]

		h := sha3.NewLegacyKeccak256()
		h.Write(input)
		computedOutput := h.Sum(nil)

		if !bytes.Equal(computedOutput, expectedOutput) {
			return false
		}
	}

	return true
}

func (k *KeccakSPJ) GetProblemID() int {
	return 2
}

func main() {
	keccakSPJ := &KeccakSPJ{}
	spj, err := SPJ.NewSPJTemplate(keccakSPJ)
	if err != nil {
		panic(fmt.Sprintf("Failed to create SPJ template: %v", err))
	}
	err = spj.Run()
	if err != nil {
		panic(fmt.Sprintf("SPJ run failed: %v", err))
	}
}
