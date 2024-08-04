package main

import (
	"fmt"
	"math/rand"
	"time"

	ipc "github.com/PolyhedraZK/proof-arena/problems/IPCUtils"
)

func RunBenchmark(prover *Prover, circuitBytes []byte, proofStats *ProofStats, requirements ProblemRequirement) {
	fmt.Println("Running benchmark")
	timer := NewTimer(proofStats)
	done := make(chan bool)

	go func() {
		proofStats.ErrorMsg = ""
		proofStats.Successful = true
		peakMemory, err := monitorResources(prover.Cmd.Process.Pid, requirements, done)
		if err != nil {
			proofStats.ErrorMsg = err.Error()
			proofStats.Successful = false
		}
		proofStats.PeakMemory = peakMemory
	}()
	fmt.Println("Starting interactive benchmark")
	InteractiveBenchmark(prover, circuitBytes, timer, requirements, done)
}

const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func generateRandomString(length int) string {
	// Seed the random number generator
	rand.Seed(time.Now().UnixNano())

	// Create a byte slice to hold the result
	result := make([]byte, length)

	// Fill the byte slice with random characters from the charset
	for i := range result {
		result[i] = charset[rand.Intn(len(charset))]
	}

	return string(result)
}
func InteractiveBenchmark(prover *Prover, circuitBytes []byte, timer *Timer, requirement ProblemRequirement, done chan bool) {
	// Send the circuit file
	err := ipc.Write_byte_array(prover.ToProverPipe, circuitBytes)
	if err != nil {
		timer.ProofStats.ErrorMsg = fmt.Sprintf("failed to send circuit: %v", err)
		timer.ProofStats.Successful = false
		done <- true
		return
	}

	fmt.Println("Sent circuit", len(circuitBytes))

	// Read N
	N := ipc.Read_uint64(prover.FromProverPipe)
	fmt.Println("Got N", N)

	// Check if N is within limits
	if N > requirement.InstanceUpperLimit {
		timer.ProofStats.ErrorMsg = "invalid instance size"
		timer.ProofStats.Successful = false
		done <- true
		return
	}

	// Wait for setup to finish
	setupBytes := ipc.Read_byte_array(prover.FromProverPipe)
	if string(setupBytes) != "setup finished" {
		timer.ProofStats.ErrorMsg = "unexpected setup response from prover" + string(setupBytes)
		timer.ProofStats.Successful = false
		done <- true
		return
	}
	timer.RecordTime()

	// Generate and send input
	inputBytes := makeInput(N)
	fmt.Println("Generated input", len(inputBytes))
	err = ipc.Write_byte_array(prover.ToProverPipe, inputBytes)
	fmt.Println("Sent input", len(inputBytes))
	if err != nil {
		timer.ProofStats.ErrorMsg = fmt.Sprintf("failed to send input: %v", err)
		timer.ProofStats.Successful = false
		done <- true
		return
	}
	timer.Reset()

	fmt.Println("Sent input", len(inputBytes))

	// Read prover output
	proverBytes := ipc.Read_byte_array(prover.FromProverPipe)

	fmt.Println("Got output", len(proverBytes))

	// Check output
	if !checkOutput(N, inputBytes, proverBytes) {
		timer.ProofStats.ErrorMsg = "incorrect output"
		timer.ProofStats.Successful = false
		done <- true
		return
	}

	// Wait for witness generation confirmation
	var witnessGenerated string
	witnessGeneratedBytes := ipc.Read_byte_array(prover.FromProverPipe)
	witnessGenerated = string(witnessGeneratedBytes)
	if witnessGenerated != "witness generated" {
		timer.ProofStats.ErrorMsg = "unexpected response from prover" + witnessGenerated
		timer.ProofStats.Successful = false
		done <- true
		return
	}
	timer.RecordTime()

	fmt.Println("Witness generated")

	// Read proof
	proofBytes := ipc.Read_byte_array(prover.FromProverPipe)
	vkBytes := ipc.Read_byte_array(prover.FromProverPipe)
	witnessBytes := ipc.Read_byte_array(prover.FromProverPipe)

	fmt.Println("Got proof", len(proofBytes))
	timer.RecordTime()

	// Verify proof
	err = ipc.Write_byte_array(prover.ToVerifierPipe, proofBytes)
	if err != nil {
		timer.ProofStats.ErrorMsg = fmt.Sprintf("failed to send proof to verifier: %v", err)
		timer.ProofStats.Successful = false
		done <- true
		return
	}
	err = ipc.Write_byte_array(prover.ToVerifierPipe, vkBytes)
	if err != nil {
		timer.ProofStats.ErrorMsg = fmt.Sprintf("failed to send vk to verifier: %v", err)
		timer.ProofStats.Successful = false
		done <- true
		return
	}
	err = ipc.Write_byte_array(prover.ToVerifierPipe, witnessBytes)
	if err != nil {
		timer.ProofStats.ErrorMsg = fmt.Sprintf("failed to send witness to verifier: %v", err)
		timer.ProofStats.Successful = false
		done <- true
		return
	}
	fmt.Println("Sent proof to verifier")
	resultBytes := ipc.Read_byte_array(prover.FromVerifierPipe)

	fmt.Println("Got result", resultBytes[0])

	if resultBytes[0] == 0 {
		timer.ProofStats.ErrorMsg = "proof verification failed"
		timer.ProofStats.Successful = false
		done <- true
		return
	}

	timer.RecordTime()
	timer.ProofStats.Successful = true
	done <- true
}
