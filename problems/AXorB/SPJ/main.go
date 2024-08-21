package main

import (
	"crypto/rand"
	"fmt"

	"github.com/PolyhedraZK/proof-arena/SPJ"
)

type AXorBSPJ struct{}

func (k *AXorBSPJ) GenerateTestData(n uint64) []byte {
	dataA := make([]byte, n) // n bytes per instance, each byte is a 0, 1 value
	dataB := make([]byte, n) // n bytes per instance, each byte is a 0, 1 value
	_, err := rand.Read(dataA)
	if err != nil {
		panic(fmt.Sprintf("Failed to generate random data: %v", err))
	}
	_, err = rand.Read(dataB)
	if err != nil {
		panic(fmt.Sprintf("Failed to generate random data: %v", err))
	}
	for i := uint64(0); i < n; i++ {
		dataA[i] = dataA[i] % 2
		dataB[i] = dataB[i] % 2
	}
	return append(dataA, dataB...)
}

func (k *AXorBSPJ) VerifyResults(testData, results []byte) bool {
	n := uint64(len(testData) / 2)
	if n*2 != uint64(len(testData)) {
		return false
	}

	for i := uint64(0); i < n; i++ {
		expectedOutput := testData[i] ^ testData[i+n]
		if results[i] != expectedOutput {
			return false
		}
	}

	return true
}

func (k *AXorBSPJ) GetProblemID() int {
	return 1
}

func main() {
	AXorBSPJ := &AXorBSPJ{}
	spj, err := SPJ.NewSPJTemplate(AXorBSPJ)
	if err != nil {
		panic(fmt.Sprintf("Failed to create SPJ template: %v", err))
	}
	err = spj.Run()
	if err != nil {
		panic(fmt.Sprintf("SPJ run failed: %v", err))
	}
}
