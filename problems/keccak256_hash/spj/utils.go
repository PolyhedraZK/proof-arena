package main

import (
	"bytes"
	"crypto/rand"
	"fmt"
	"time"

	"go.uber.org/zap"
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
	checkPoints := make(map[string]time.Time)
	checkPoints["start"] = time.Now()
	return &Timer{
		ProofStats:  proofStats,
		CheckPoints: checkPoints,
	}
}

func (t *Timer) CheckPoint(name string) {
	t.CheckPoints[name] = time.Now()
}

func (t *Timer) GetDuration(startCheckpoint string, endCheckpoint string) float64 {
	start := t.CheckPoints[startCheckpoint]
	end := t.CheckPoints[endCheckpoint]
	return end.Sub(start).Seconds()
}

func HandleError(logger *zap.Logger, proofStats *ProofStats, err error, message string, done chan<- bool) {
	logger.Error(message, zap.Error(err))
	proofStats.ErrorMsg = fmt.Sprintf("%s: %v", message, err)
	proofStats.Successful = false
	done <- true
}
