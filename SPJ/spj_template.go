package SPJ

import (
	"context"
	"encoding/binary"
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

	timeLimit := flag.Int("time", 0, "Time limit in seconds")
	memoryLimit := flag.Int("memory", 0, "Memory limit in MB")
	cpuLimit := flag.Int("cpu", 0, "CPU limit")
	instanceUpperLimit := flag.Uint64("largestN", 0, "Instance upper limit in bytes")
	jsonOutputPath := flag.String("json", "", "Path to the output JSON file")
	judgerMode := flag.Bool("judger", false, "Enable judger mode (disable prints and redirections)")

	flag.Parse()

	config.ProverPath, config.ProverArg = strings.Split(config.ProverPath, " ")[0], strings.Split(config.ProverPath, " ")[1:]
	config.VerifierPath, config.VerifierArg = strings.Split(config.VerifierPath, " ")[0], strings.Split(config.VerifierPath, " ")[1:]
	config.JsonOutputPath = *jsonOutputPath
	config.Requirements = ProblemRequirement{
		TimeLimit:          *timeLimit,
		MemoryLimit:        *memoryLimit,
		CPULimit:           *cpuLimit,
		InstanceUpperLimit: *instanceUpperLimit,
	}
	config.JudgerMode = *judgerMode
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

	spj.resultCollector.result.ProblemID = impl.GetProblemID()

	return spj, nil
}

func (spj *SPJTemplate) Run() error {
	if !spj.config.JudgerMode {
		fmt.Println("Starting SPJ execution...")
	}

	ctx := context.Background()
	defer spj.pipeManager.Close()

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
	if !spj.config.JudgerMode {
		spj.logger.Log("Running prover...")
	}
	pipeNames, err := spj.pipeManager.GetProverPipeNames()
	spjToProver, proverToSPJ := pipeNames[0], pipeNames[1]
	if err != nil {
		return nil, fmt.Errorf("failed to get prover pipe names: %w", err)
	}
	spj.config.ProverArg = append(spj.config.ProverArg, "-toMe", spjToProver, "-toSPJ", proverToSPJ)
	if !spj.config.JudgerMode {
		fmt.Println(spj.config.ProverArg)
	}
	cmd := exec.CommandContext(ctx, spj.config.ProverPath, spj.config.ProverArg...)
	if !spj.config.JudgerMode {
		fmt.Println(cmd.String())
	}
	proverStdout, _ := cmd.StdoutPipe()
	proverStderr, _ := cmd.StderrPipe()

	spj.timer.Start("setup")
	if err := cmd.Start(); err != nil {
		return nil, fmt.Errorf("failed to start prover: %w", err)
	}
	if !spj.config.JudgerMode {
		go io.Copy(os.Stdout, proverStdout)
		go io.Copy(os.Stderr, proverStderr)
	}

	done := spj.resourceMonitor.StartPeriodicUpdate(ctx, time.Millisecond, cmd.Process.Pid)
	defer close(done)
	// Start monitoring the prover process
	processDone := make(chan error, 1)
	go func() {
		// wait for 1 second to make sure the process is started
		time.Sleep(time.Second)
		processDone <- cmd.Wait()
	}()

	if err := spj.resourceMonitor.SetCPUAffinity(cmd.Process.Pid, spj.config.Requirements.CPULimit); err != nil {
		if !spj.config.JudgerMode {
			spj.logger.Log(fmt.Sprintf("Warning: Failed to set CPU affinity: %v", err))
		}
	} else {
		if !spj.config.JudgerMode {
			spj.logger.Log(fmt.Sprintf("Successfully set CPU affinity to %d cores", spj.config.Requirements.CPULimit))
		}
	}
	setupDone := make(chan error, 1)
	go func() {
		setupDone <- spj.setup()
	}()

	select {
	case err := <-setupDone:
		if err != nil {
			return nil, fmt.Errorf("setup failed: %w", err)
		}
		spj.timer.Stop("setup")
	case err := <-processDone:
		return nil, fmt.Errorf("prover execution failed: %w", err)
	}

	spj.timer.Start("proof")
	spj.timer.Start("witness")
	proofDone := make(chan *ProofData, 1)
	proofError := make(chan error, 1)
	go func() {
		testData := spj.implementation.GenerateTestData(spj.resultCollector.result.N)

		if err := spj.pipeManager.SendToProver(testData); err != nil {
			proofError <- err
			return
		}

		results, err := spj.pipeManager.ReadFromProver()
		if err != nil {
			proofError <- err
			return
		}

		if !spj.implementation.VerifyResults(testData, results) {
			proofError <- fmt.Errorf("results verification failed")
			return
		}

		if err := spj.pipeManager.WaitForProverMessage("witness generated"); err != nil {
			proofError <- err
			return
		}
		spj.timer.Stop("witness")

		proofByte, err := spj.pipeManager.ReadFromProver()
		if err != nil {
			proofError <- err
			return
		}
		vkByte, err := spj.pipeManager.ReadFromProver()
		if err != nil {
			proofError <- err
			return
		}
		pubWitnessByte, err := spj.pipeManager.ReadFromProver()
		if err != nil {
			proofError <- err
			return
		}
		proofData := &ProofData{
			Proof:      proofByte,
			VK:         vkByte,
			PubWitness: pubWitnessByte,
		}
		proofDone <- proofData
	}()
	var proofData *ProofData
	select {
	case err := <-proofError:
		return nil, fmt.Errorf("proof generation failed: %w", err)
	case err := <-processDone:
		// try to get proofData for 10 second, interval 1 millisecond
		for i := 0; i < 10000; i++ {
			select {
			case proofData = <-proofDone:
				spj.timer.Stop("proof")
				break
			default:
				time.Sleep(time.Millisecond)
			}
		}
		if proofData == nil {
			return nil, fmt.Errorf("prover execution failed: %w", err)
		}
	}

	spj.resultCollector.SetProofSize(len(proofData.Proof))

	return proofData, nil
}

func (spj *SPJTemplate) runVerifier(ctx context.Context, proof *ProofData) error {
	if !spj.config.JudgerMode {
		spj.logger.Log("Running verifier...")
	}

	pipeNames, err := spj.pipeManager.GetVerifierPipeNames()
	spjToVerifier, verifierToSPJ := pipeNames[0], pipeNames[1]

	spj.config.VerifierArg = append(spj.config.VerifierArg, "-toMe", spjToVerifier, "-toSPJ", verifierToSPJ)

	cmd := exec.CommandContext(ctx, spj.config.VerifierPath, spj.config.VerifierArg...)
	if err != nil {
		return fmt.Errorf("failed to get verifier stdin: %w", err)
	}

	verifierStdout, err := cmd.StdoutPipe()
	verifierStderr, err := cmd.StderrPipe()
	if err != nil {
		return fmt.Errorf("failed to get verifier stdout: %w", err)
	}

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start verifier: %w", err)
	}

	// limit to 1 CPU core
	if err := spj.resourceMonitor.SetCPUAffinity(cmd.Process.Pid, 1); err != nil {
		if !spj.config.JudgerMode {
			spj.logger.Log(fmt.Sprintf("Warning: Failed to set CPU affinity: %v", err))
		}
	} else {
		if !spj.config.JudgerMode {
			spj.logger.Log(fmt.Sprintf("Successfully set CPU affinity to 1 core"))
		}
	}

	processDone := make(chan error, 1)
	go func() {
		processDone <- cmd.Wait()
	}()

	if !spj.config.JudgerMode {
		go io.Copy(os.Stdout, verifierStdout)
		go io.Copy(os.Stderr, verifierStderr)
	}

	spj.timer.Start("verify")

	proofVerifyDone := make(chan bool, 1)
	proofVerifyError := make(chan error, 1)
	go func() {
		if err := spj.pipeManager.SendToVerifier(proof.Proof); err != nil {
			proofVerifyError <- fmt.Errorf("failed to send proof data to verifier: %w", err)
		}
		if err := spj.pipeManager.SendToVerifier(proof.VK); err != nil {
			proofVerifyError <- fmt.Errorf("failed to send vk to verifier: %w", err)
		}
		if err := spj.pipeManager.SendToVerifier(proof.PubWitness); err != nil {
			proofVerifyError <- fmt.Errorf("failed to send public witness to verifier: %w", err)
		}

		result, err := spj.pipeManager.ReadFromVerifier()
		if err != nil {
			proofVerifyError <- fmt.Errorf("failed to read verification result: %w", err)
		}
		if len(result) != 1 {
			proofVerifyError <- fmt.Errorf("unexpected verification result format: %v", result)
		}
		numRepeatsBytes, err := spj.pipeManager.ReadFromVerifier()
		if len(numRepeatsBytes) != 8 {
			proofVerifyError <- fmt.Errorf("unexpected numRepeats format: %v", numRepeatsBytes)
		}
		numRepeats := binary.LittleEndian.Uint64(numRepeatsBytes)
		spj.resultCollector.result.VerifierNumRepeats = int(numRepeats)

		switch result[0] {
		case 0xff:
			if !spj.config.JudgerMode {
				spj.logger.Log("Verification successful")
			}
		case 0x00:
			proofVerifyError <- fmt.Errorf("verification failed")
		default:
			proofVerifyError <- fmt.Errorf("unexpected verification result: %v", result[0])
		}
		proofVerifyDone <- true
	}()

	select {
	case err := <-proofVerifyError:
		return fmt.Errorf("proof verification failed: %w", err)
	case err := <-processDone:
		verificationResult := false
		for i := 0; i < 10000; i++ {
			select {
			case result := <-proofVerifyDone:
				if !result {
					return fmt.Errorf("verification failed")
				}
				verificationResult = true
				if !spj.config.JudgerMode {
					fmt.Println("Verification done")
				}
				spj.timer.Stop("verify")
				break
			default:
				time.Sleep(time.Millisecond)
			}
		}
		if !verificationResult {
			return fmt.Errorf("verification failed: %w", err)
		}
	}
	return nil
}

func (spj *SPJTemplate) setup() error {
	if err := spj.readProverInfo(); err != nil {
		return err
	}

	N, err := spj.pipeManager.ReadUint64FromProver()
	spj.resultCollector.result.N = N
	return err
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

	if !spj.config.JudgerMode {
		spj.logger.Log(fmt.Sprintf("Prover Name: %s", proverName))
		spj.logger.Log(fmt.Sprintf("Algorithm Name: %s", algorithmName))
		spj.logger.Log(fmt.Sprintf("Proof System Name: %s", proofSystemName))
	}

	spj.resultCollector.SetProverInfo(proverName, proofSystemName, algorithmName)

	return nil
}

func (spj *SPJTemplate) collectResults() {
	spj.resultCollector.SetStatus(true)
	spj.resultCollector.SetTimes(spj.timer.GetTimes())
	spj.resultCollector.SetPeakMemory(spj.resourceMonitor.GetPeakMemory())
	spj.resultCollector.SetMaxCPU(spj.config.Requirements.CPULimit)
}

func (spj *SPJTemplate) outputResults() {
	spj.resultCollector.OutputResults(spj.config.JsonOutputPath)
	spj.resultCollector.OutputResults("spj_output/result.json")
}
