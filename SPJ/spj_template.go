package SPJ

import (
	"flag"
	"fmt"
	"os"
	"os/exec"
	"time"
)

type Config struct {
	ProverPath   string
	VerifierPath string
	CircuitFile  string
	Requirements ProblemRequirement
}

type ProblemRequirement struct {
	TimeLimit          int
	MemoryLimit        int
	CPULimit           int
	InstanceUpperLimit uint64
}

type SPJImplementation interface {
	GenerateTestData(n uint64) []byte
	VerifyResults(testData, results []byte) bool
}

type SPJTemplate struct {
	PipeManager     *PipeManager
	Timer           *Timer
	ResourceMonitor *ResourceMonitor
	CgroupManager   *CgroupManager
	Logger          *Logger
	ResultCollector *ResultCollector
	ProverName      string
	AlgorithmName   string
	ProofSystemName string
	N               uint64
	Config          Config
	Implementation  SPJImplementation
}

func parseFlags() Config {
	config := Config{}

	flag.StringVar(&config.ProverPath, "prover", "", "Path to the prover executable")
	flag.StringVar(&config.VerifierPath, "verifier", "", "Path to the verifier executable")
	flag.StringVar(&config.CircuitFile, "circuit", "", "Path to the circuit file")

	timeLimit := flag.Int("time", 0, "Time limit in seconds")
	memoryLimit := flag.Int("memory", 0, "Memory limit in MB")
	cpuLimit := flag.Int("cpu", 0, "CPU limit")
	instanceUpperLimit := flag.Uint64("largestN", 0, "Instance upper limit in bytes")

	flag.Parse()

	config.Requirements = ProblemRequirement{
		TimeLimit:          *timeLimit,
		MemoryLimit:        *memoryLimit,
		CPULimit:           *cpuLimit,
		InstanceUpperLimit: *instanceUpperLimit,
	}

	return config
}

func NewSPJTemplate(implementation SPJImplementation) (*SPJTemplate, error) {
	config := parseFlags()

	pipeManager, err := NewPipeManager()
	if err != nil {
		return nil, fmt.Errorf("failed to create PipeManager: %v", err)
	}

	resourceMonitor := NewResourceMonitor()

	cgroupManager, err := NewCgroupManager("spj_prover")
	if err != nil {
		return nil, fmt.Errorf("failed to create CgroupManager: %v", err)
	}

	if err := cgroupManager.SetCPULimit(config.Requirements.CPULimit); err != nil {
		return nil, fmt.Errorf("failed to set CPU limit: %v", err)
	}

	return &SPJTemplate{
		PipeManager:     pipeManager,
		Timer:           NewTimer(),
		ResourceMonitor: resourceMonitor,
		CgroupManager:   cgroupManager,
		Logger:          NewLogger(os.Stderr),
		ResultCollector: NewResultCollector(),
		Config:          config,
		Implementation:  implementation,
	}, nil
}

func (spj *SPJTemplate) Run() error {
	defer spj.PipeManager.Close()
	defer spj.CgroupManager.Cleanup()

	done := spj.ResourceMonitor.StartPeriodicUpdate(time.Second)
	defer close(done)

	if err := spj.setup(); err != nil {
		return fmt.Errorf("setup failed: %v", err)
	}

	if err := spj.runProver(); err != nil {
		return fmt.Errorf("prover run failed: %v", err)
	}

	if err := spj.runVerifier(); err != nil {
		return fmt.Errorf("verifier run failed: %v", err)
	}

	spj.collectResults()
	spj.outputResults()

	return nil
}

func (spj *SPJTemplate) setup() error {
	spj.Logger.Log("Starting setup...")
	spj.Timer.Start("setup")
	defer spj.Timer.Stop("setup")

	if err := spj.PipeManager.SendPipeNames(); err != nil {
		return err
	}

	if err := spj.readProverInfo(); err != nil {
		return err
	}

	if err := spj.sendCircuitData(); err != nil {
		return err
	}

	if err := spj.readNumberOfInstances(); err != nil {
		return err
	}

	return spj.waitForSetupFinished()
}

func (spj *SPJTemplate) runProver() error {
	spj.Logger.Log("Running prover...")
	spj.Timer.Start("prover")
	defer spj.Timer.Stop("prover")

	cmd := exec.Command(spj.Config.ProverPath)
	cmd.Stdout = spj.PipeManager.SpjToProverPipe
	cmd.Stdin = spj.PipeManager.ProverToSPJPipe

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start prover: %v", err)
	}

	if err := spj.CgroupManager.AddProcess(cmd.Process.Pid); err != nil {
		return fmt.Errorf("failed to add prover to cgroup: %v", err)
	}

	testData := spj.Implementation.GenerateTestData(spj.N)
	if err := spj.PipeManager.SendToProver(testData); err != nil {
		return err
	}

	results, err := spj.PipeManager.ReadFromProver()
	if err != nil {
		return err
	}

	if !spj.Implementation.VerifyResults(testData, results) {
		return fmt.Errorf("results verification failed")
	}

	if err := spj.waitForWitnessGenerated(); err != nil {
		return err
	}

	proof, err := spj.PipeManager.ReadFromProver()
	if err != nil {
		return err
	}

	spj.ResultCollector.SetProofSize(len(proof))

	if err := cmd.Wait(); err != nil {
		return fmt.Errorf("prover execution failed: %v", err)
	}

	return nil
}

func (spj *SPJTemplate) runVerifier() error {
	spj.Logger.Log("Running verifier...")
	spj.Timer.Start("verifier")
	defer spj.Timer.Stop("verifier")

	cmd := exec.Command(spj.Config.VerifierPath)
	cmd.Stdout = spj.PipeManager.SpjToVerifierPipe
	cmd.Stdin = spj.PipeManager.VerifierToSPJPipe

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start verifier: %v", err)
	}

	if err := spj.PipeManager.SendVerifierPipeNames(); err != nil {
		return fmt.Errorf("failed to send verifier pipe names: %v", err)
	}

	combinedProofData, err := spj.PipeManager.ReadFromProver()
	if err != nil {
		return fmt.Errorf("failed to read proof data from prover: %v", err)
	}

	if err := spj.PipeManager.SendToVerifier(combinedProofData); err != nil {
		return fmt.Errorf("failed to send combined proof data to verifier: %v", err)
	}

	result, err := spj.PipeManager.ReadFromVerifier()
	if err != nil {
		return fmt.Errorf("failed to read verification result: %v", err)
	}

	if len(result) != 1 {
		panic(fmt.Sprintf("Unexpected verification result format: %v", result))
	}

	switch result[0] {
	case 0xff:
		spj.Logger.Log("Verification successful")
	case 0x00:
		panic("Verification failed")
	default:
		panic(fmt.Sprintf("Unexpected verification result: %v", result[0]))
	}

	if err := cmd.Wait(); err != nil {
		return fmt.Errorf("verifier execution failed: %v", err)
	}

	return nil
}

func (spj *SPJTemplate) readProverInfo() error {
	var err error
	spj.ProverName, err = spj.PipeManager.ReadStringFromProver()
	if err != nil {
		return err
	}
	spj.AlgorithmName, err = spj.PipeManager.ReadStringFromProver()
	if err != nil {
		return err
	}
	spj.ProofSystemName, err = spj.PipeManager.ReadStringFromProver()
	if err != nil {
		return err
	}

	spj.Logger.Log(fmt.Sprintf("Prover Name: %s", spj.ProverName))
	spj.Logger.Log(fmt.Sprintf("Algorithm Name: %s", spj.AlgorithmName))
	spj.Logger.Log(fmt.Sprintf("Proof System Name: %s", spj.ProofSystemName))

	return nil
}

func (spj *SPJTemplate) sendCircuitData() error {
	circuitData, err := os.ReadFile(spj.Config.CircuitFile)
	if err != nil {
		return fmt.Errorf("failed to read circuit file: %v", err)
	}
	return spj.PipeManager.SendToProver(circuitData)
}

func (spj *SPJTemplate) readNumberOfInstances() error {
	var err error
	spj.N, err = spj.PipeManager.ReadUint64FromProver()
	if err != nil {
		return err
	}
	spj.Logger.Log(fmt.Sprintf("Number of instances: %d", spj.N))
	return nil
}

func (spj *SPJTemplate) waitForSetupFinished() error {
	return spj.PipeManager.WaitForProverMessage("setup finished")
}

func (spj *SPJTemplate) waitForWitnessGenerated() error {
	return spj.PipeManager.WaitForProverMessage("witness generated")
}

func (spj *SPJTemplate) collectResults() {
	spj.ResultCollector.SetTimes(spj.Timer.GetTimes())
	spj.ResultCollector.SetPeakMemory(spj.ResourceMonitor.GetPeakMemory())
	spj.ResultCollector.SetMaxCPU(spj.Config.Requirements.CPULimit)
	spj.ResultCollector.SetProverInfo(spj.ProverName, spj.ProofSystemName, spj.AlgorithmName)
}

func (spj *SPJTemplate) outputResults() {
	spj.ResultCollector.OutputResults()
}
