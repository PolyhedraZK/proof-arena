package main

import "time"

type ProblemRequirement struct {
	TimeLimit          int    `json:"time_limit"`
	MemoryLimit        int    `json:"memory_limit"`
	CPULimit           int    `json:"cpu_limit"`
	InstanceUpperLimit uint64 `json:"instance_upper_limit"`
}

type ProofStats struct {
	ProblemID             int     `json:"problem_id"`
	ProverName            string  `json:"prover_name"`
	ProofSystem           string  `json:"proof_system"`
	Algorithm             string  `json:"algorithm"`
	SetupTime             float64 `json:"setup_time"`
	WitnessGenerationTime float64 `json:"witness_generation_time"`
	ProofGenerationTime   float64 `json:"proof_generation_time"`
	VerifyTime            float64 `json:"verify_time"`
	PeakMemory            int     `json:"peak_memory"`
	ProofSize             int     `json:"proof_size"`
	Successful            bool    `json:"successful"`
	ErrorMsg              string  `json:"error_msg"`
}

type Timer struct {
	ProofStats  *ProofStats
	CheckPoints map[string]time.Time
}
