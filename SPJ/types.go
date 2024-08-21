package SPJ

type Config struct {
	ProverPath   string
	VerifierPath string
	ProverArg    []string
	VerifierArg  []string
	CircuitFile  string
	Requirements ProblemRequirement
}

type ProblemRequirement struct {
	TimeLimit          int
	MemoryLimit        int
	CPULimit           int
	InstanceUpperLimit uint64
}

type ProofData struct {
	Proof      []byte
	VK         []byte
	PubWitness []byte
}

type SPJImplementation interface {
	GenerateTestData(n uint64) []byte
	VerifyResults(testData, results []byte) bool
}
