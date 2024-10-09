package main

import (
	"bytes"
	"crypto/rand"
	"fmt"

	"crypto/sha256"

	"github.com/PolyhedraZK/proof-arena/SPJ"
)

type Sha256SPJ struct{}

func (k *Sha256SPJ) GenerateTestData(n uint64) []byte {
	data := make([]byte, n*64) // 64 bytes per instance
	_, err := rand.Read(data)
	if err != nil {
		panic(fmt.Sprintf("Failed to generate random data: %v", err))
	}
	return data
}

func (k *Sha256SPJ) VerifyResults(testData, results []byte) bool {
	n := uint64(len(testData) / 64)
	if uint64(len(results)) != n*32 {
		return false
	}

	for i := uint64(0); i < n; i++ {
		input := testData[i*64 : (i+1)*64]
		expectedOutput := results[i*32 : (i+1)*32]

		h := sha256.New()
		h.Write(input)
		computedOutput := h.Sum(nil)

		if !bytes.Equal(computedOutput, expectedOutput) {
			return false
		}
	}

	return true
}

func (k *Sha256SPJ) GetProblemID() int {
	return 3
}

func main() {
	sha256SPJ := &Sha256SPJ{}
	spj, err := SPJ.NewSPJTemplate(sha256SPJ)
	if err != nil {
		panic(fmt.Sprintf("Failed to create SPJ template: %v", err))
	}
	err = spj.Run()
	if err != nil {
		panic(fmt.Sprintf("SPJ run failed: %v", err))
	}
}
