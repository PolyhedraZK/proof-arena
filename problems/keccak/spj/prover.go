package main

import (
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"strings"

	ipc "github.com/PolyhedraZK/proof-arena/problems/IPCUtils"
	seccomp "github.com/seccomp/libseccomp-golang"
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

func setSeccompFilter() error {
	// Initialize a new seccomp filter with default action to deny all syscalls
	filter, err := seccomp.NewFilter(seccomp.ActErrno.SetReturnCode(int16(1)))
	if err != nil {
		log.Fatalf("Error creating seccomp filter: %v", err)
	}

	// List of syscalls necessary for basic I/O and process execution
	allowSyscalls := []string{
		"read", "write", "close", "execve", "fork", "vfork",
		"exit", "exit_group", "rt_sigreturn", "sigaltstack",
		"brk", "arch_prctl", "mmap", "mprotect", "munmap",
		"fstat", "lseek", "futex", "sched_yield", "clone",
		"wait4", "getpid", "gettid", "set_tid_address",
		"fadvise64", "clock_gettime", "uname", "pipe", "pipe2", "dup", "dup2", "dup3",
	}

	for _, syscallName := range allowSyscalls {
		syscallID, err := seccomp.GetSyscallFromName(syscallName)
		if err != nil {
			log.Fatalf("Error getting syscall ID for %s: %v", syscallName, err)
		}
		err = filter.AddRule(syscallID, seccomp.ActAllow)
		if err != nil {
			log.Fatalf("Error adding rule for syscall %s: %v", syscallName, err)
		}
	}

	// Load the filter into the kernel
	err = filter.Load()
	if err != nil {
		log.Fatalf("Error loading seccomp filter: %v", err)
	}
	return nil
}

func NewProver(proverPath, verifierPath string, proofStats *ProofStats) (*Prover, error) {

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

	// pipe proveStderr to os.Stderr
	go io.Copy(os.Stderr, proverStderr)

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

	// pipe verifierStderr to os.Stderr
	go io.Copy(os.Stderr, verifierStderr)
	go io.Copy(os.Stderr, proverStderr)
	go io.Copy(os.Stdout, proverStdout)
	go io.Copy(os.Stdout, verifierStdout)

	if err := proverCmd.Start(); err != nil {
		return nil, fmt.Errorf("failed to start prover: %v", err)
	}

	if err := verifierCmd.Start(); err != nil {
		return nil, fmt.Errorf("failed to start verifier: %v", err)
	}

	spjToProverPipeName := "/tmp/problem1_spjToProver" + generateRandomString(10)
	proverToSpjPipeName := "/tmp/problem1_proverToSpj" + generateRandomString(10)

	spjToVerifierPipeName := "/tmp/problem1_spjToVerifier" + generateRandomString(10)
	verifierToSpjPipeName := "/tmp/problem1_verifierToSpj" + generateRandomString(10)
	perm := os.FileMode(0666) // rw-rw-rw-

	// Create the pipes
	spjToProverPipe, err := ipc.CreatePipe(spjToProverPipeName, perm)
	if err != nil {
		proofStats.ErrorMsg = fmt.Sprintf("failed to create pipe: %v", err)
		proofStats.Successful = false
		return nil, err
	}

	proverToSpjPipe, err := ipc.CreatePipe(proverToSpjPipeName, perm)
	if err != nil {
		proofStats.ErrorMsg = fmt.Sprintf("failed to create pipe: %v", err)
		proofStats.Successful = false
		return nil, err
	}

	spjToVerifierPipe, err := ipc.CreatePipe(spjToVerifierPipeName, perm)
	if err != nil {
		proofStats.ErrorMsg = fmt.Sprintf("failed to create pipe: %v", err)
		proofStats.Successful = false
		return nil, err
	}

	verifierToSpjPipe, err := ipc.CreatePipe(verifierToSpjPipeName, perm)
	if err != nil {
		proofStats.ErrorMsg = fmt.Sprintf("failed to create pipe: %v", err)
		proofStats.Successful = false
		return nil, err
	}

	// send pipe name to prover
	err = ipc.Write_string(proverStdin, spjToProverPipeName)
	if err != nil {
		proofStats.ErrorMsg = fmt.Sprintf("failed to send pipe name to prover: %v", err)
		proofStats.Successful = false
		return nil, err
	}

	err = ipc.Write_string(proverStdin, proverToSpjPipeName)
	if err != nil {
		proofStats.ErrorMsg = fmt.Sprintf("failed to send pipe name to prover: %v", err)
		proofStats.Successful = false
		return nil, err
	}

	err = ipc.Write_string(verifierStdin, spjToVerifierPipeName)
	if err != nil {
		proofStats.ErrorMsg = fmt.Sprintf("failed to send pipe name to verifier: %v", err)
		proofStats.Successful = false
		return nil, err
	}

	err = ipc.Write_string(verifierStdin, verifierToSpjPipeName)
	if err != nil {
		proofStats.ErrorMsg = fmt.Sprintf("failed to send pipe name to verifier: %v", err)
		proofStats.Successful = false
		return nil, err
	}

	return &Prover{
		Cmd:              proverCmd,
		ToProverPipe:     spjToProverPipe,
		FromProverPipe:   proverToSpjPipe,
		ProverStderr:     proverStderr,
		ToVerifierPipe:   spjToVerifierPipe,
		FromVerifierPipe: verifierToSpjPipe,
		VerifierStderr:   verifierStderr,
	}, nil
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
