package main

import (
	"bytes"
	"fmt"
	"io"
)

func RunBenchmark(prover *Prover, circuitBytes []byte, proofStats *ProofStats, requirements ProblemRequirement) {
	timer := NewTimer(proofStats)
	done := make(chan bool)

	go func() {
		peakMemory, err := monitorResources(prover.Cmd.Process.Pid, requirements, done)
		if err != nil {
			proofStats.ErrorMsg = err.Error()
			proofStats.Successful = false
		} else {
			proofStats.ErrorMsg = ""
			proofStats.Successful = true
		}
		proofStats.PeakMemory = peakMemory
	}()

	InteractiveBenchmark(prover, circuitBytes, timer, requirements, done)
}

func InteractiveBenchmark(prover *Prover, circuitBytes []byte, timer *Timer, requirement ProblemRequirement, done chan bool) {
	// Send the circuit file
	_, err := prover.ProverStdin.Write(circuitBytes)
	if err != nil {
		timer.ProofStats.ErrorMsg = fmt.Sprintf("failed to send circuit: %v", err)
		timer.ProofStats.Successful = false
		done <- true
		return
	}

	// Read N
	var N int64
	_, err = fmt.Fscanln(prover.ProverStdout, &N)
	if err != nil {
		timer.ProofStats.ErrorMsg = fmt.Sprintf("failed to read N: %v", err)
		timer.ProofStats.Successful = false
		done <- true
		return
	}

	// Check if N is within limits
	if N <= 0 || N > int64(requirement.InstanceUpperLimit) {
		timer.ProofStats.ErrorMsg = "invalid instance size"
		timer.ProofStats.Successful = false
		done <- true
		return
	}

	// Wait for setup to finish
	var setupFinished string
	_, err = fmt.Fscanln(prover.ProverStdout, &setupFinished)
	if err != nil || setupFinished != "setup finished" {
		timer.ProofStats.ErrorMsg = "unexpected response from prover"
		timer.ProofStats.Successful = false
		done <- true
		return
	}
	timer.RecordTime()

	// Generate and send input
	inputBytes := makeInput(N)
	_, err = prover.ProverStdin.Write(inputBytes)
	if err != nil {
		timer.ProofStats.ErrorMsg = fmt.Sprintf("failed to send input: %v", err)
		timer.ProofStats.Successful = false
		done <- true
		return
	}
	timer.Reset()

	// Read prover output
	proverBytes := make([]byte, 32*N)
	_, err = io.ReadFull(prover.ProverStdout, proverBytes)
	if err != nil {
		timer.ProofStats.ErrorMsg = fmt.Sprintf("failed to read prover output: %v", err)
		timer.ProofStats.Successful = false
		done <- true
		return
	}

	// Check output
	if !checkOutput(N, inputBytes, proverBytes) {
		timer.ProofStats.ErrorMsg = "incorrect output"
		timer.ProofStats.Successful = false
		done <- true
		return
	}

	// Wait for witness generation confirmation
	var witnessGenerated string
	_, err = fmt.Fscanln(prover.ProverStdout, &witnessGenerated)
	if err != nil || witnessGenerated != "witness generated" {
		timer.ProofStats.ErrorMsg = "unexpected response from prover"
		timer.ProofStats.Successful = false
		done <- true
		return
	}

	// Read proof
	var proofBytes bytes.Buffer
	_, err = io.Copy(&proofBytes, prover.ProverStdout)
	if err != nil && err != io.EOF {
		timer.ProofStats.ErrorMsg = fmt.Sprintf("failed to read prover proof: %v", err)
		timer.ProofStats.Successful = false
		done <- true
		return
	}
	timer.RecordTime()

	// Verify proof
	_, err = prover.VerifierStdin.Write(proofBytes.Bytes())
	if err != nil {
		timer.ProofStats.ErrorMsg = fmt.Sprintf("failed to send proof to verifier: %v", err)
		timer.ProofStats.Successful = false
		done <- true
		return
	}

	resultBytes := make([]byte, 1)
	_, err = prover.VerifierStdout.Read(resultBytes)
	if err != nil {
		timer.ProofStats.ErrorMsg = fmt.Sprintf("failed to read verifier output: %v", err)
		timer.ProofStats.Successful = false
		done <- true
		return
	}

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
