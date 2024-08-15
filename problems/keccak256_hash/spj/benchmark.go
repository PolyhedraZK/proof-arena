package main

import (
	"fmt"
	"math/rand"
	"time"

	ipc "github.com/PolyhedraZK/proof-arena/problems/IPCUtils"
	"go.uber.org/zap"
)

func RunBenchmark(prover *Prover, circuitBytes []byte, proofStats *ProofStats, requirements ProblemRequirement, logger *zap.Logger) {
	logger.Info("Running benchmark")
	timer := NewTimer(proofStats)
	done := make(chan bool)

	go func() {
		peakMemory, err := monitorResources(prover.Cmd.Process.Pid, requirements, done, logger)
		if err != nil {
			proofStats.ErrorMsg = err.Error()
			proofStats.Successful = false
		}
		proofStats.PeakMemory = float64(peakMemory)
	}()

	logger.Info("Starting interactive benchmark")
	InteractiveBenchmark(prover, circuitBytes, timer, requirements, done, logger)
}

func InteractiveBenchmark(prover *Prover, circuitBytes []byte, timer *Timer, requirement ProblemRequirement, done chan bool, logger *zap.Logger) {
	if err := ipc.Write_byte_array(prover.ToProverPipe, circuitBytes); err != nil {
		HandleError(logger, timer.ProofStats, err, "Failed to send circuit", done)
		return
	}

	logger.Info("Sent circuit", zap.Int("size", len(circuitBytes)))

	N, _ := ipc.Read_uint64(prover.FromProverPipe)
	timer.ProofStats.N = int(N)
	logger.Info("Got N", zap.Uint64("N", N))

	if N > requirement.InstanceUpperLimit {
		HandleError(logger, timer.ProofStats, fmt.Errorf("invalid instance size %d limit %d", N, requirement.InstanceUpperLimit), "Invalid instance size", done)
		return
	}

	setupBytes, err := ipc.Read_byte_array(prover.FromProverPipe)
	if err != nil || string(setupBytes) != "setup finished" {
		HandleError(logger, timer.ProofStats, fmt.Errorf("unexpected setup response from prover: %s", err.Error()), "Unexpected setup response", done)
		return
	}
	timer.CheckPoint("setup")

	inputBytes := makeInput(N)
	logger.Info("Generated input", zap.Int("size", len(inputBytes)))

	if err := ipc.Write_byte_array(prover.ToProverPipe, inputBytes); err != nil {
		HandleError(logger, timer.ProofStats, err, "Failed to send input", done)
		return
	}

	proverBytes, err := ipc.Read_byte_array(prover.FromProverPipe)
	logger.Info("Got output", zap.Int("size", len(proverBytes)))

	if err != nil || !checkOutput(N, inputBytes, proverBytes) {
		HandleError(logger, timer.ProofStats, fmt.Errorf("incorrect output, error: %s", err.Error()), "Incorrect output", done)
		return
	}

	witnessGeneratedBytes, err := ipc.Read_byte_array(prover.FromProverPipe)
	witnessGenerated := string(witnessGeneratedBytes)
	if witnessGenerated != "witness generated" {
		HandleError(logger, timer.ProofStats, fmt.Errorf("unexpected response from prover: %s", err.Error()), "Unexpected response", done)
		return
	}
	timer.CheckPoint("witness")

	logger.Info("Witness generated")

	proofBytes, err := ipc.Read_byte_array(prover.FromProverPipe)
	if err != nil {
		HandleError(logger, timer.ProofStats, err, "Failed to read proof", done)
		return
	}
	vkBytes, err := ipc.Read_byte_array(prover.FromProverPipe)
	if err != nil {
		HandleError(logger, timer.ProofStats, err, "Failed to read vk", done)
		return
	}
	witnessBytes, err := ipc.Read_byte_array(prover.FromProverPipe)
	if err != nil {
		HandleError(logger, timer.ProofStats, err, "Failed to read witness", done)
		return
	}

	logger.Info("Got proof", zap.Int("size", len(proofBytes)))
	timer.CheckPoint("proof")

	if err := ipc.Write_byte_array(prover.ToVerifierPipe, proofBytes); err != nil {
		HandleError(logger, timer.ProofStats, err, "Failed to send proof to verifier", done)
		return
	}

	if err := ipc.Write_byte_array(prover.ToVerifierPipe, vkBytes); err != nil {
		HandleError(logger, timer.ProofStats, err, "Failed to send vk to verifier", done)
		return
	}

	if err := ipc.Write_byte_array(prover.ToVerifierPipe, witnessBytes); err != nil {
		HandleError(logger, timer.ProofStats, err, "Failed to send witness to verifier", done)
		return
	}

	logger.Info("Sent proof to verifier")
	resultBytes, err := ipc.Read_byte_array(prover.FromVerifierPipe)

	if err != nil || resultBytes[0] == 0 {
		HandleError(logger, timer.ProofStats, fmt.Errorf("proof verification failed, error message: %s", err.Error()), "Proof verification failed", done)
		return
	}
	logger.Info("Got result", zap.Uint8("result", resultBytes[0]))

	timer.CheckPoint("verification")
	timer.ProofStats.Successful = true

	timer.ProofStats.SetupTime = timer.GetDuration("start", "setup")
	timer.ProofStats.WitnessGenerationTime = timer.GetDuration("setup", "witness")
	timer.ProofStats.ProofGenerationTime = timer.GetDuration("setup", "proof")
	timer.ProofStats.VerifyTime = timer.GetDuration("proof", "verification")
	timer.ProofStats.ProofSize = float64(len(proofBytes))

	done <- true
}

func generateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	rand.Seed(time.Now().UnixNano())
	result := make([]byte, length)
	for i := range result {
		result[i] = charset[rand.Intn(len(charset))]
	}
	return string(result)
}
