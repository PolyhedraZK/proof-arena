package main

import (
	"fmt"
	"io"
	"os"
	"os/exec"
	"strings"

	ipc "github.com/PolyhedraZK/proof-arena/problems/IPCUtils"
	"go.uber.org/zap"
)

type Prover struct {
	Cmd              *exec.Cmd
	ToProverPipe     io.WriteCloser
	FromProverPipe   io.ReadCloser
	ProverStderr     io.ReadCloser
	ToVerifierPipe   io.WriteCloser
	FromVerifierPipe io.ReadCloser
	VerifierStderr   io.ReadCloser
}

func NewProver(proverPath, verifierPath string, proofStats *ProofStats, logger *zap.Logger) (*Prover, error) {
	proverSplit := strings.Split(proverPath, " ")
	proverPath = proverSplit[0]
	proverArgs := proverSplit[1:]

	verifierSplit := strings.Split(verifierPath, " ")
	verifierPath = verifierSplit[0]
	verifyArgs := verifierSplit[1:]

	proverCmd := exec.Command(proverPath, proverArgs...)
	verifierCmd := exec.Command(verifierPath, verifyArgs...)

	proverStdin, err := proverCmd.StdinPipe()
	if err != nil {
		logger.Error("Failed to get prover stdin", zap.Error(err))
		return nil, fmt.Errorf("failed to get prover stdin: %v", err)
	}
	proverStdout, err := proverCmd.StdoutPipe()
	if err != nil {
		logger.Error("Failed to get prover stdout", zap.Error(err))
		return nil, fmt.Errorf("failed to get prover stdout: %v", err)
	}
	proverStderr, err := proverCmd.StderrPipe()
	if err != nil {
		logger.Error("Failed to get prover stderr", zap.Error(err))
		return nil, fmt.Errorf("failed to get prover stderr: %v", err)
	}

	go io.Copy(os.Stderr, proverStderr)

	verifierStdin, err := verifierCmd.StdinPipe()
	if err != nil {
		logger.Error("Failed to get verifier stdin", zap.Error(err))
		return nil, fmt.Errorf("failed to get verifier stdin: %v", err)
	}
	verifierStdout, err := verifierCmd.StdoutPipe()
	if err != nil {
		logger.Error("Failed to get verifier stdout", zap.Error(err))
		return nil, fmt.Errorf("failed to get verifier stdout: %v", err)
	}
	verifierStderr, err := verifierCmd.StderrPipe()
	if err != nil {
		logger.Error("Failed to get verifier stderr", zap.Error(err))
		return nil, fmt.Errorf("failed to get verifier stderr: %v", err)
	}

	go io.Copy(os.Stderr, verifierStderr)
	go io.Copy(os.Stdout, proverStdout)
	go io.Copy(os.Stdout, verifierStdout)
	fmt.Println("Starting prover and verifier")
	if err := proverCmd.Start(); err != nil {
		logger.Error("Failed to start prover", zap.Error(err))
		return nil, fmt.Errorf("failed to start prover: %v", err)
	}

	if err := verifierCmd.Start(); err != nil {
		logger.Error("Failed to start verifier", zap.Error(err))
		return nil, fmt.Errorf("failed to start verifier: %v", err)
	}

	spjToProverPipeName := "/tmp/problem1_spjToProver_" + generateRandomString(10)
	proverToSpjPipeName := "/tmp/problem1_proverToSpj_" + generateRandomString(10)
	spjToVerifierPipeName := "/tmp/problem1_spjToVerifier_" + generateRandomString(10)
	verifierToSpjPipeName := "/tmp/problem1_verifierToSpj_" + generateRandomString(10)
	perm := os.FileMode(0666)

	var spjToProverPipe, proverToSpjPipe, spjToVerifierPipe, verifierToSpjPipe os.File

	pipes := []struct {
		name string
		pipe *os.File
	}{
		{spjToProverPipeName, &spjToProverPipe},
		{proverToSpjPipeName, &proverToSpjPipe},
		{spjToVerifierPipeName, &spjToVerifierPipe},
		{verifierToSpjPipeName, &verifierToSpjPipe},
	}

	for _, p := range pipes {
		pipe, err := ipc.CreatePipe(p.name, perm)
		if err != nil {
			logger.Error("Failed to create pipe", zap.String("name", p.name), zap.Error(err))
			proofStats.ErrorMsg = fmt.Sprintf("failed to create pipe %s: %v", p.name, err)
			proofStats.Successful = false
			return nil, err
		}
		*p.pipe = *pipe
	}
	fmt.Println("Pipes created")
	if err := sendPipeNames(proverStdin, spjToProverPipeName, proverToSpjPipeName); err != nil {
		logger.Error("Failed to send pipe names to prover", zap.Error(err))
		proofStats.ErrorMsg = fmt.Sprintf("failed to send pipe names to prover: %v", err)
		proofStats.Successful = false
		return nil, err
	}

	if err := sendPipeNames(verifierStdin, spjToVerifierPipeName, verifierToSpjPipeName); err != nil {
		logger.Error("Failed to send pipe names to verifier", zap.Error(err))
		proofStats.ErrorMsg = fmt.Sprintf("failed to send pipe names to verifier: %v", err)
		proofStats.Successful = false
		return nil, err
	}
	fmt.Println("Pipe names sent")
	// Get Prover Name, Algorithm Name, Proof System Name
	proverName, err := ipc.Read_string(&proverToSpjPipe)
	if err != nil {
		proofStats.ErrorMsg = fmt.Sprintf("failed to read prover name: %v", err)
		proofStats.Successful = false
		logger.Error("Failed to read prover name", zap.Error(err))
		return nil, err
	}
	algorithmName, err := ipc.Read_string(&proverToSpjPipe)
	if err != nil {
		proofStats.ErrorMsg = fmt.Sprintf("failed to read algorithm name: %v", err)
		proofStats.Successful = false
		logger.Error("Failed to read algorithm name", zap.Error(err))
		return nil, err
	}
	proofSystemName, err := ipc.Read_string(&proverToSpjPipe)
	if err != nil {
		proofStats.ErrorMsg = fmt.Sprintf("failed to read proof system name: %v", err)
		proofStats.Successful = false
		logger.Error("Failed to read proof system name", zap.Error(err))
		return nil, err
	}
	fmt.Println("Prover Name", proverName)

	logger.Info("Prover Name", zap.String("name", proverName))
	logger.Info("Algorithm Name", zap.String("name", algorithmName))
	logger.Info("Proof System Name", zap.String("name", proofSystemName))

	proofStats.ProverName = proverName
	proofStats.Algorithm = algorithmName
	proofStats.ProofSystem = proofSystemName

	return &Prover{
		Cmd:              proverCmd,
		ToProverPipe:     &spjToProverPipe,
		FromProverPipe:   &proverToSpjPipe,
		ProverStderr:     proverStderr,
		ToVerifierPipe:   &spjToVerifierPipe,
		FromVerifierPipe: &verifierToSpjPipe,
		VerifierStderr:   verifierStderr,
	}, nil
}

func sendPipeNames(stdin io.WriteCloser, pipeName1, pipeName2 string) error {
	if err := ipc.Write_string(stdin, pipeName1); err != nil {
		return err
	}
	return ipc.Write_string(stdin, pipeName2)
}

func (p *Prover) Cleanup() {
	p.Cmd.Process.Kill()
	p.ToProverPipe.Close()
	p.FromProverPipe.Close()
	p.ProverStderr.Close()
	p.ToVerifierPipe.Close()
	p.FromVerifierPipe.Close()
	p.VerifierStderr.Close()
}
