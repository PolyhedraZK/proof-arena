package main

import (
	"fmt"
	"io"
	"os/exec"
)

type Prover struct {
	Cmd            *exec.Cmd
	ProverStdin    io.WriteCloser
	ProverStdout   io.ReadCloser
	ProverStderr   io.ReadCloser
	VerifierStdin  io.WriteCloser
	VerifierStdout io.ReadCloser
	VerifierStderr io.ReadCloser
}

func NewProver(proverPath, verifierPath string) (*Prover, error) {
	proverCmd := exec.Command(proverPath)
	verifierCmd := exec.Command(verifierPath)

	proverStdin, err := proverCmd.StdinPipe()
	if err != nil {
		return nil, fmt.Errorf("failed to get prover stdin: %v", err)
	}
	proverStdout, err := proverCmd.StdoutPipe()
	if err != nil {
		return nil, fmt.Errorf("failed to get prover stdout: %v", err)
	}
	proverStderr, err := proverCmd.StderrPipe()
	if err != nil {
		return nil, fmt.Errorf("failed to get prover stderr: %v", err)
	}

	verifierStdin, err := verifierCmd.StdinPipe()
	if err != nil {
		return nil, fmt.Errorf("failed to get verifier stdin: %v", err)
	}
	verifierStdout, err := verifierCmd.StdoutPipe()
	if err != nil {
		return nil, fmt.Errorf("failed to get verifier stdout: %v", err)
	}
	verifierStderr, err := verifierCmd.StderrPipe()
	if err != nil {
		return nil, fmt.Errorf("failed to get verifier stderr: %v", err)
	}

	if err := proverCmd.Start(); err != nil {
		return nil, fmt.Errorf("failed to start prover: %v", err)
	}

	if err := verifierCmd.Start(); err != nil {
		return nil, fmt.Errorf("failed to start verifier: %v", err)
	}

	return &Prover{
		Cmd:            proverCmd,
		ProverStdin:    proverStdin,
		ProverStdout:   proverStdout,
		ProverStderr:   proverStderr,
		VerifierStdin:  verifierStdin,
		VerifierStdout: verifierStdout,
		VerifierStderr: verifierStderr,
	}, nil
}

func (p *Prover) Cleanup() {
	p.Cmd.Process.Kill()
	p.ProverStdin.Close()
	p.ProverStdout.Close()
	p.ProverStderr.Close()
	p.VerifierStdin.Close()
	p.VerifierStdout.Close()
	p.VerifierStderr.Close()
}
