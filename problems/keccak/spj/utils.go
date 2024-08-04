package main

import (
	"bytes"
	"crypto/rand"
	"time"

	"golang.org/x/crypto/sha3"
)

func makeInput(N uint64) []byte {
	input := make([]byte, N*64)
	rand.Read(input)
	return input
}

func keccak256(input []byte) []byte {
	hash := sha3.NewLegacyKeccak256()
	hash.Write(input)
	return hash.Sum(nil)
}

func checkHash(input, hash []byte) bool {
	expectedHash := keccak256(input)
	return bytes.Equal(hash, expectedHash)
}

func checkOutput(N uint64, input, output []byte) bool {
	for i := uint64(0); i < N; i++ {
		if !checkHash(input[i*64:(i+1)*64], output[i*32:(i+1)*32]) {
			return false
		}
	}
	return true
}

func NewTimer(proofStats *ProofStats) *Timer {
	return &Timer{
		ProofStats: proofStats,
		Start:      time.Now(),
		Round:      0,
	}
}

func (t *Timer) Reset() {
	t.Start = time.Now()
}

func (t *Timer) RecordTime() {
	elapsed := time.Since(t.Start).Seconds()
	switch t.Round {
	case 0:
		t.ProofStats.SetupTime = elapsed
	case 1:
		t.ProofStats.WitnessGenerationTime = elapsed
	case 2:
		t.ProofStats.ProofGenerationTime = elapsed
	case 3:
		t.ProofStats.VerifyTime = elapsed
	}
	t.Round++
	t.Start = time.Now()
}
