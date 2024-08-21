package SPJ

import (
	"context"
	"flag"
	"fmt"
	"io"
	"os"
	"os/exec"
	"strings"
	"time"
)

type SPJTemplate struct {
	config          Config
	pipeManager     *PipeManager
	timer           *Timer
	resourceMonitor *ResourceMonitor
	logger          *Logger
	resultCollector *ResultCollector
	implementation  SPJImplementation
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
	config.ProverPath, config.ProverArg = strings.Split(config.ProverPath, " ")[0], strings.Split(config.ProverPath, " ")[1:]
	config.VerifierPath, config.VerifierArg = strings.Split(config.VerifierPath, " ")[0], strings.Split(config.VerifierPath, " ")[1:]
	config.Requirements = ProblemRequirement{
		TimeLimit:          *timeLimit,
		MemoryLimit:        *memoryLimit,
		CPULimit:           *cpuLimit,
		InstanceUpperLimit: *instanceUpperLimit,
	}

	return config
}

func NewSPJTemplate(impl SPJImplementation) (*SPJTemplate, error) {
	pm, err := NewPipeManager()
	if err != nil {
		return nil, fmt.Errorf("failed to create PipeManager: %w", err)
	}
	config := parseFlags()
	spj := &SPJTemplate{
		config:          config,
		pipeManager:     pm,
		timer:           NewTimer(),
		resourceMonitor: NewResourceMonitor(),
		logger:          NewLogger(os.Stderr),
		resultCollector: NewResultCollector(),
		implementation:  impl,
	}

	return spj, nil
}

func (spj *SPJTemplate) Run() error {
	ctx := context.Background()
	defer spj.pipeManager.Close()

	done := spj.resourceMonitor.StartPeriodicUpdate(ctx, time.Second)
	defer close(done)

	proof, err := spj.runProver(ctx)
	if err != nil {
		return fmt.Errorf("prover run failed: %w", err)
	}

	if err := spj.runVerifier(ctx, proof); err != nil {
		return fmt.Errorf("verifier run failed: %w", err)
	}

	spj.collectResults()
	spj.outputResults()

	return nil
}

func (spj *SPJTemplate) runProver(ctx context.Context) (*ProofData, error) {
	spj.logger.Log("Running prover...")

	cmd := exec.CommandContext(ctx, spj.config.ProverPath, spj.config.ProverArg...)
	proverStdin, err := cmd.StdinPipe()
	if err != nil {
		return nil, fmt.Errorf("failed to get prover stdin: %w", err)
	}

	spj.timer.Start("setup")
	if err := cmd.Start(); err != nil {
		return nil, fmt.Errorf("failed to start prover: %w", err)
	}

	if err := spj.resourceMonitor.SetCPUAffinity(cmd.Process.Pid, spj.config.Requirements.CPULimit); err != nil {
		spj.logger.Log(fmt.Sprintf("Warning: Failed to set CPU affinity: %v", err))
	} else {
		spj.logger.Log(fmt.Sprintf("Successfully set CPU affinity to %d cores", spj.config.Requirements.CPULimit))
	}

	if err := spj.setup(proverStdin); err != nil {
		return nil, fmt.Errorf("setup failed: %w", err)
	}
	spj.timer.Stop("setup")

	spj.timer.Start("proof")
	spj.timer.Start("witness")

	testData := spj.implementation.GenerateTestData(spj.resultCollector.result.N)

	if err := spj.pipeManager.SendToProver(testData); err != nil {
		return nil, err
	}

	results, err := spj.pipeManager.ReadFromProver()
	if err != nil {
		return nil, err
	}

	if !spj.implementation.VerifyResults(testData, results) {
		return nil, fmt.Errorf("results verification failed")
	}

	if err := spj.pipeManager.WaitForProverMessage("witness generated"); err != nil {
		return nil, err
	}
	spj.timer.Stop("witness")

	proofByte, err := spj.pipeManager.ReadFromProver()
	if err != nil {
		return nil, err
	}
	vkByte, err := spj.pipeManager.ReadFromProver()
	if err != nil {
		return nil, err
	}
	pubWitnessByte, err := spj.pipeManager.ReadFromProver()
	if err != nil {
		return nil, err
	}
	spj.timer.Stop("proof")

	spj.resultCollector.SetProofSize(len(proofByte))

	if err := cmd.Wait(); err != nil {
		return nil, fmt.Errorf("prover execution failed: %w", err)
	}

	return &ProofData{
		Proof:      proofByte,
		VK:         vkByte,
		PubWitness: pubWitnessByte,
	}, nil
}

func (spj *SPJTemplate) runVerifier(ctx context.Context, proof *ProofData) error {
	spj.logger.Log("Running verifier...")

	cmd := exec.CommandContext(ctx, spj.config.VerifierPath, spj.config.VerifierArg...)
	verifierStdin, err := cmd.StdinPipe()
	if err != nil {
		return fmt.Errorf("failed to get verifier stdin: %w", err)
	}

	verifierStdout, err := cmd.StdoutPipe()
	verifierStderr, err := cmd.StderrPipe()
	go io.Copy(os.Stdout, verifierStdout)
	go io.Copy(os.Stderr, verifierStderr)
	if err != nil {
		return fmt.Errorf("failed to get verifier stdout: %w", err)
	}

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start verifier: %w", err)
	}

	spj.timer.Start("verify")

	if err := spj.pipeManager.SendVerifierPipeNames(verifierStdin); err != nil {
		return fmt.Errorf("failed to send verifier pipe names: %w", err)
	}

	if err := spj.pipeManager.SendToVerifier(proof.Proof); err != nil {
		return fmt.Errorf("failed to send proof data to verifier: %w", err)
	}
	if err := spj.pipeManager.SendToVerifier(proof.VK); err != nil {
		return fmt.Errorf("failed to send vk to verifier: %w", err)
	}
	if err := spj.pipeManager.SendToVerifier(proof.PubWitness); err != nil {
		return fmt.Errorf("failed to send public witness to verifier: %w", err)
	}

	result, err := spj.pipeManager.ReadFromVerifier()
	if err != nil {
		return fmt.Errorf("failed to read verification result: %w", err)
	}
	spj.timer.Stop("verify")

	if len(result) != 1 {
		return fmt.Errorf("unexpected verification result format: %v", result)
	}

	switch result[0] {
	case 0xff:
		spj.logger.Log("Verification successful")
	case 0x00:
		return fmt.Errorf("verification failed")
	default:
		return fmt.Errorf("unexpected verification result: %v", result[0])
	}

	return cmd.Wait()
}

func (spj *SPJTemplate) setup(proverStdin io.Writer) error {
	if err := spj.pipeManager.SendProverPipeNames(proverStdin); err != nil {
		return err
	}

	if err := spj.readProverInfo(); err != nil {
		return err
	}

	if err := spj.sendCircuitData(); err != nil {
		return err
	}
	N, err := spj.pipeManager.ReadUint64FromProver()
	if err != nil {
		return err
	}
	spj.resultCollector.result.N = N
	return spj.pipeManager.WaitForProverMessage("setup finished")
}

func (spj *SPJTemplate) readProverInfo() error {
	proverName, err := spj.pipeManager.ReadStringFromProver()
	if err != nil {
		return err
	}
	algorithmName, err := spj.pipeManager.ReadStringFromProver()
	if err != nil {
		return err
	}
	proofSystemName, err := spj.pipeManager.ReadStringFromProver()
	if err != nil {
		return err
	}

	spj.logger.Log(fmt.Sprintf("Prover Name: %s", proverName))
	spj.logger.Log(fmt.Sprintf("Algorithm Name: %s", algorithmName))
	spj.logger.Log(fmt.Sprintf("Proof System Name: %s", proofSystemName))

	spj.resultCollector.SetProverInfo(proverName, proofSystemName, algorithmName)

	return nil
}

func (spj *SPJTemplate) sendCircuitData() error {
	circuitData, err := os.ReadFile(spj.config.CircuitFile)
	if err != nil {
		return fmt.Errorf("failed to read circuit file: %w", err)
	}
	return spj.pipeManager.SendToProver(circuitData)
}

func (spj *SPJTemplate) collectResults() {
	spj.resultCollector.SetStatus(true)
	spj.resultCollector.SetTimes(spj.timer.GetTimes())
	spj.resultCollector.SetPeakMemory(spj.resourceMonitor.GetPeakMemory())
	spj.resultCollector.SetMaxCPU(spj.config.Requirements.CPULimit)
}

func (spj *SPJTemplate) outputResults() {
	spj.resultCollector.OutputResults()
}
