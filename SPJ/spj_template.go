package SPJ

import (
	"flag"
	"fmt"
	"io"
	"os"
	"os/exec"
	"runtime"
	"strings"
	"syscall"
	"time"
	"unsafe"
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

	if flag.NFlag() != 7 {
		flag.Usage()
		os.Exit(1)
	}

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

	return &SPJTemplate{
		PipeManager:     pipeManager,
		Timer:           NewTimer(),
		ResourceMonitor: resourceMonitor,
		Logger:          NewLogger(os.Stderr),
		ResultCollector: NewResultCollector(),
		Config:          config,
		Implementation:  implementation,
	}, nil
}

func (spj *SPJTemplate) Run() error {
	defer spj.PipeManager.Close()

	done := spj.ResourceMonitor.StartPeriodicUpdate(time.Second)
	defer close(done)
	var proof *proofData
	var err error
	if proof, err = spj.runProver(); err != nil {
		return fmt.Errorf("prover run failed: %v", err)
	}

	if err := spj.runVerifier(proof); err != nil {
		return fmt.Errorf("verifier run failed: %v", err)
	}

	spj.collectResults()
	spj.outputResults()

	return nil
}

func (spj *SPJTemplate) setup(proverStdin io.Writer) error {
	if err := spj.PipeManager.SendProverPipeNames(proverStdin); err != nil {
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

type proofData struct {
	proof      []byte
	vk         []byte
	pubWitness []byte
}

func (spj *SPJTemplate) runProver() (*proofData, error) {
	spj.Logger.Log("Running prover...")

	pathAndArg := strings.Split(spj.Config.ProverPath, " ")
	path := pathAndArg[0]
	args := pathAndArg[1:]

	cmd := exec.Command(path, args...)
	proverStdin, err := cmd.StdinPipe()
	if err != nil {
		return nil, fmt.Errorf("failed to get prover stdin: %v", err)
	}

	spj.Timer.Start("setup")
	if err := cmd.Start(); err != nil {
		return nil, fmt.Errorf("failed to start prover: %v", err)
	}

	if err := spj.setCPUAffinity(cmd.Process.Pid); err != nil {
		spj.Logger.Log(fmt.Sprintf("Warning: Failed to set CPU affinity: %v", err))
	} else {
		spj.Logger.Log(fmt.Sprintf("Successfully set CPU affinity to %d cores", spj.Config.Requirements.CPULimit))
	}
	// setup
	if err := spj.setup(proverStdin); err != nil {
		return nil, fmt.Errorf("setup failed: %v", err)
	}
	spj.Timer.Stop("setup")
	spj.Timer.Start("proof")
	spj.Timer.Start("witness")
	testData := spj.Implementation.GenerateTestData(spj.N)
	spj.ResultCollector.SetN(spj.N)
	if err := spj.PipeManager.SendToProver(testData); err != nil {
		return nil, err
	}

	results, err := spj.PipeManager.ReadFromProver()
	if err != nil {
		return nil, err
	}

	if !spj.Implementation.VerifyResults(testData, results) {
		return nil, fmt.Errorf("results verification failed")
	}

	if err := spj.waitForWitnessGenerated(); err != nil {
		return nil, err
	}
	spj.Timer.Stop("witness")

	proofByte, err := spj.PipeManager.ReadFromProver()
	if err != nil {
		return nil, err
	}
	vkByte, err := spj.PipeManager.ReadFromProver()
	if err != nil {
		return nil, err
	}
	pubWitnessByte, err := spj.PipeManager.ReadFromProver()
	if err != nil {
		return nil, err
	}
	spj.Timer.Stop("proof")

	spj.ResultCollector.SetProofSize(len(proofByte))

	if err := cmd.Wait(); err != nil {
		return nil, fmt.Errorf("prover execution failed: %v", err)
	}

	return &proofData{
		proof:      proofByte,
		vk:         vkByte,
		pubWitness: pubWitnessByte,
	}, nil
}

func (spj *SPJTemplate) runVerifier(proof *proofData) error {
	spj.Logger.Log("Running verifier...")

	pathAndArg := strings.Split(spj.Config.VerifierPath, " ")
	path := pathAndArg[0]
	args := pathAndArg[1:]

	cmd := exec.Command(path, args...)
	verifierStdin, err := cmd.StdinPipe()
	verifierStdout, err := cmd.StdoutPipe()
	verifierStderr, err := cmd.StderrPipe()

	// pipe verifier stdout to SPJ stderr
	go io.Copy(os.Stdout, verifierStdout)
	go io.Copy(os.Stderr, verifierStderr)

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start verifier: %v", err)
	}
	spj.Timer.Start("verify")
	if err := spj.PipeManager.SendVerifierPipeNames(verifierStdin); err != nil {
		return fmt.Errorf("failed to send verifier pipe names: %v", err)
	}
	fmt.Println("Sent verifier pipe names")
	if err := spj.PipeManager.SendToVerifier(proof.proof); err != nil {
		return fmt.Errorf("failed to send proof data to verifier: %v", err)
	}
	if err := spj.PipeManager.SendToVerifier(proof.vk); err != nil {
		return fmt.Errorf("failed to send vk to verifier: %v", err)
	}
	if err := spj.PipeManager.SendToVerifier(proof.pubWitness); err != nil {
		return fmt.Errorf("failed to send public witness to verifier: %v", err)
	}
	fmt.Println("Sent proof to verifier")

	result, err := spj.PipeManager.ReadFromVerifier()
	if err != nil {
		return fmt.Errorf("failed to read verification result: %v", err)
	}
	spj.Timer.Stop("verify")

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

func (spj *SPJTemplate) setCPUAffinity(pid int) error {
	if runtime.GOOS != "linux" {
		return fmt.Errorf("setCPUAffinity is only supported on Linux")
	}

	var mask uint64
	for i := 0; i < spj.Config.Requirements.CPULimit; i++ {
		mask |= 1 << i
	}

	_, _, errno := syscall.RawSyscall(syscall.SYS_SCHED_SETAFFINITY, uintptr(pid), uintptr(unsafe.Sizeof(mask)), uintptr(unsafe.Pointer(&mask)))
	if errno != 0 {
		return fmt.Errorf("failed to set CPU affinity: %v", errno)
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
	spj.ResultCollector.SetStatus(true)
	spj.ResultCollector.SetTimes(spj.Timer.GetTimes())
	spj.ResultCollector.SetPeakMemory(spj.ResourceMonitor.GetPeakMemory())
	spj.ResultCollector.SetMaxCPU(spj.Config.Requirements.CPULimit)
	spj.ResultCollector.SetProverInfo(spj.ProverName, spj.ProofSystemName, spj.AlgorithmName)
}

func (spj *SPJTemplate) outputResults() {
	spj.ResultCollector.OutputResults()
}
