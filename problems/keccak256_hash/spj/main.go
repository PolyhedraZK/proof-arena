package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"

	"go.uber.org/zap"
)

func main() {
	logger, err := zap.NewProduction()
	if err != nil {
		panic("Failed to initialize logger: " + err.Error())
	}
	defer logger.Sync()

	config := parseFlags()

	circuitBytes, err := os.ReadFile(config.circuitFile)
	if err != nil {
		logger.Fatal("Failed to read circuit file", zap.Error(err))
	}

	proofStats := &ProofStats{ProblemID: 1}
	fmt.Println("proofStats.ProblemID", proofStats.ProblemID)
	prover, err := NewProver(config.proverPath, config.verifierPath, proofStats, logger)
	if err != nil {
		logger.Fatal("Failed to start prover", zap.Error(err))
	}
	defer prover.Cleanup()

	logger.Info("Prover initialized")

	RunBenchmark(prover, circuitBytes, proofStats, config.requirements, logger)

	// Normalize proof stats
	proofStats.WitnessGenerationTime /= float64(proofStats.N)
	proofStats.ProofGenerationTime /= float64(proofStats.N)
	proofStats.VerifyTime /= float64(proofStats.N)
	proofStats.ProofSize /= float64(proofStats.N)
	proofStats.SetupTime /= float64(proofStats.N)
	proofStats.PeakMemory /= float64(proofStats.N)

	pathStr := fmt.Sprintf("%d-%s.json", proofStats.ProblemID, proofStats.ProverName)
	if err := writeProofStats(pathStr, proofStats); err != nil {
		logger.Fatal("Failed to write proof stats", zap.Error(err))
	}

	logger.Info("Benchmark completed successfully")
}

type Config struct {
	proverPath   string
	verifierPath string
	circuitFile  string
	requirements ProblemRequirement
}

func parseFlags() Config {
	config := Config{}

	flag.StringVar(&config.proverPath, "prover", "", "Path to the prover executable")
	flag.StringVar(&config.verifierPath, "verifier", "", "Path to the verifier executable")
	flag.StringVar(&config.circuitFile, "circuit", "", "Path to the circuit file")

	timeLimit := flag.Int("time", 0, "Time limit in seconds")
	memoryLimit := flag.Int("memory", 0, "Memory limit in MB")
	cpuLimit := flag.Int("cpu", 0, "CPU limit")
	instanceUpperLimit := flag.Uint64("largestN", 0, "Instance upper limit in bytes")

	flag.Parse()

	config.requirements = ProblemRequirement{
		TimeLimit:          *timeLimit,
		MemoryLimit:        *memoryLimit,
		CPULimit:           *cpuLimit,
		InstanceUpperLimit: *instanceUpperLimit,
	}

	return config
}

func writeProofStats(path string, stats *ProofStats) error {
	jsonBytes, err := json.Marshal(stats)
	if err != nil {
		return err
	}

	return os.WriteFile(path, jsonBytes, 0644)
}
