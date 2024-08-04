package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
)

func main() {
	// Parse command-line flags
	proverPath := flag.String("prover", "", "Path to the prover executable")
	verifierPath := flag.String("verifier", "", "Path to the verifier executable")
	circuitFile := flag.String("circuit", "", "Path to the circuit file")
	proofStatsPath := flag.String("stats", "", "Path to write proof stats")
	timeLimit := flag.Int("time", 0, "Time limit in seconds")
	memoryLimit := flag.Int("memory", 0, "Memory limit in MB")
	cpuLimit := flag.Int("cpu", 0, "CPU limit")
	instanceUpperLimit := flag.Int("largestN", 0, "Instance upper limit in bytes")
	flag.Parse()

	requirements := ProblemRequirement{
		TimeLimit:          *timeLimit,
		MemoryLimit:        *memoryLimit,
		CPULimit:           *cpuLimit,
		InstanceUpperLimit: *instanceUpperLimit,
	}

	// Read the circuit
	circuitBytes, err := os.ReadFile(*circuitFile)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to read circuit file: %v\n", err)
		os.Exit(1)
	}

	// Initialize proof stats
	proofStats := &ProofStats{ProblemID: 1}

	// Start the prover and verifier
	prover, err := NewProver(*proverPath, *verifierPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to start prover: %v\n", err)
		os.Exit(1)
	}
	defer prover.Cleanup()

	// Run the benchmark
	RunBenchmark(prover, circuitBytes, proofStats, requirements)

	// Serialize and write the proof stats
	jsonBytes, err := json.Marshal(proofStats)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to serialize proof stats: %v\n", err)
		os.Exit(1)
	}

	if err := os.WriteFile(*proofStatsPath, jsonBytes, 0644); err != nil {
		fmt.Fprintf(os.Stderr, "Failed to write proof stats: %v\n", err)
		os.Exit(1)
	}
}
