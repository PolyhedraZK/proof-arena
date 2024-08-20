package SPJ

import (
	"encoding/json"
	"fmt"
	"time"
)

type BenchmarkResult struct {
	ProblemID             int               `json:"problem_id"`
	ProverName            string            `json:"prover_name"`
	ProofSystem           string            `json:"proof_system"`
	Algorithm             string            `json:"algorithm"`
	SetupTime             float64           `json:"setup_time"`
	WitnessGenerationTime float64           `json:"witness_generation_time"`
	ProofGenerationTime   float64           `json:"proof_generation_time"`
	VerifyTime            float64           `json:"verify_time"`
	PeakMemory            uint64            `json:"peak_memory"`
	ProofSize             int               `json:"proof_size"`
	Status                bool              `json:"status"`
	ErrorMsg              string            `json:"error_msg"`
	MaxCPU                int               `json:"max_cpu"`
	AdditionalMetrics     map[string]string `json:"additional_metrics,omitempty"`
}

type ResultCollector struct {
	result BenchmarkResult
}

func NewResultCollector() *ResultCollector {
	return &ResultCollector{
		result: BenchmarkResult{
			AdditionalMetrics: make(map[string]string),
		},
	}
}

func (rc *ResultCollector) SetProblemID(id int) {
	rc.result.ProblemID = id
}

func (rc *ResultCollector) SetProverInfo(name, proofSystem, algorithm string) {
	rc.result.ProverName = name
	rc.result.ProofSystem = proofSystem
	rc.result.Algorithm = algorithm
}

func (rc *ResultCollector) SetTimes(times map[string]time.Duration) {
	rc.result.SetupTime = times["setup"].Seconds()
	rc.result.WitnessGenerationTime = times["witness"].Seconds()
	rc.result.ProofGenerationTime = times["proof"].Seconds()
	rc.result.VerifyTime = times["verify"].Seconds()
}

func (rc *ResultCollector) SetPeakMemory(memory uint64) {
	rc.result.PeakMemory = memory / (1024 * 1024) // Convert to MB
}

func (rc *ResultCollector) SetProofSize(size int) {
	rc.result.ProofSize = size
}

func (rc *ResultCollector) SetStatus(status bool) {
	rc.result.Status = status
}

func (rc *ResultCollector) SetErrorMsg(msg string) {
	rc.result.ErrorMsg = msg
}

func (rc *ResultCollector) AddAdditionalMetric(key, value string) {
	rc.result.AdditionalMetrics[key] = value
}

func (rc *ResultCollector) OutputResults() {
	jsonResult, err := json.MarshalIndent(rc.result, "", "  ")
	if err != nil {
		fmt.Printf("Error marshaling results: %v\n", err)
		return
	}
	fmt.Println(string(jsonResult))
}

func (rc *ResultCollector) SetMaxCPU(maxCPU int) {
	rc.result.MaxCPU = maxCPU
}
