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
		proofStats.PeakMemory = peakMemory
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

	N := ipc.Read_uint64(prover.FromProverPipe)
	logger.Info("Got N", zap.Uint64("N", N))

	if N > requirement.InstanceUpperLimit {
		HandleError(logger, timer.ProofStats, fmt.Errorf("invalid instance size %d limit %d", N, requirement.InstanceUpperLimit), "Invalid instance size", done)
		return
	}

	setupBytes := ipc.Read_byte_array(prover.FromProverPipe)
	if string(setupBytes) != "setup finished" {
		HandleError(logger, timer.ProofStats, fmt.Errorf("unexpected setup response from prover: %s", string(setupBytes)), "Unexpected setup response", done)
		return
	}
	timer.CheckPoint("setup")

	inputBytes := makeInput(N)
	logger.Info("Generated input", zap.Int("size", len(inputBytes)))

	if err := ipc.Write_byte_array(prover.ToProverPipe, inputBytes); err != nil {
		HandleError(logger, timer.ProofStats, err, "Failed to send input", done)
		return
	}

	proverBytes := ipc.Read_byte_array(prover.FromProverPipe)
	logger.Info("Got output", zap.Int("size", len(proverBytes)))

	if !checkOutput(N, inputBytes, proverBytes) {
		HandleError(logger, timer.ProofStats, fmt.Errorf("incorrect output"), "Incorrect output", done)
		return
	}

	witnessGeneratedBytes := ipc.Read_byte_array(prover.FromProverPipe)
	witnessGenerated := string(witnessGeneratedBytes)
	if witnessGenerated != "witness generated" {
		HandleError(logger, timer.ProofStats, fmt.Errorf("unexpected response from prover: %s", witnessGenerated), "Unexpected response", done)
		return
	}
	timer.CheckPoint("witness")

	logger.Info("Witness generated")

	proofBytes := ipc.Read_byte_array(prover.FromProverPipe)
	vkBytes := ipc.Read_byte_array(prover.FromProverPipe)
	witnessBytes := ipc.Read_byte_array(prover.FromProverPipe)

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
	resultBytes := ipc.Read_byte_array(prover.FromVerifierPipe)

	logger.Info("Got result", zap.Uint8("result", resultBytes[0]))

	if resultBytes[0] == 0 {
		HandleError(logger, timer.ProofStats, fmt.Errorf("proof verification failed"), "Proof verification failed", done)
		return
	}

	timer.CheckPoint("verification")
	timer.ProofStats.Successful = true

	timer.ProofStats.SetupTime = timer.GetDuration("start", "setup")
	timer.ProofStats.WitnessGenerationTime = timer.GetDuration("setup", "witness")
	timer.ProofStats.ProofGenerationTime = timer.GetDuration("setup", "proof")
	timer.ProofStats.VerifyTime = timer.GetDuration("proof", "verification")
	timer.ProofStats.ProofSize = len(proofBytes)

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
