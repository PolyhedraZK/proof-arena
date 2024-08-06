package main

import (
	"bufio"
	"fmt"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"syscall"
)

const (
	dataSize        = 1024 * 1024 * 1024 // 1 GB
	namedPipePath   = "/tmp/benchmark_pipe"
	compilationFlag = "-O3"
)

type BenchmarkResult struct {
	Hash       string
	Time       float64
	Throughput float64
}

func compileProgram(sourcePath, outputPath string) error {
	moveCmd := exec.Command("mv", sourcePath+".txt", sourcePath)
	compileCmd := exec.Command("g++", sourcePath, "-o", outputPath, compilationFlag)
	moveBackCmd := exec.Command("mv", sourcePath, sourcePath+".txt")

	if err := moveCmd.Run(); err != nil {
		return fmt.Errorf("failed to move file: %v", err)
	}
	defer moveBackCmd.Run()

	if err := compileCmd.Run(); err != nil {
		return fmt.Errorf("failed to compile: %v", err)
	}

	return nil
}

func runBenchmark(cmd *exec.Cmd, writer func(interface{}) error) (*BenchmarkResult, error) {
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, fmt.Errorf("failed to create stdout pipe: %v", err)
	}

	if err := cmd.Start(); err != nil {
		return nil, fmt.Errorf("failed to start program: %v", err)
	}

	if err := writer(dataSize); err != nil {
		return nil, err
	}

	scanner := bufio.NewScanner(stdout)
	scanner.Scan()
	hash := scanner.Text()
	scanner.Scan()
	timeStr := scanner.Text()

	if err := cmd.Wait(); err != nil {
		return nil, fmt.Errorf("program exited with error: %v", err)
	}

	timeFloat, err := strconv.ParseFloat(timeStr, 64)
	if err != nil {
		return nil, fmt.Errorf("failed to parse time: %v", err)
	}

	timeSeconds := timeFloat / 1000 / 1000
	throughput := float64(dataSize) / timeSeconds / 1024 / 1024 / 1024

	return &BenchmarkResult{
		Hash:       hash,
		Time:       timeFloat,
		Throughput: throughput,
	}, nil
}

func stdioBenchmark() (*BenchmarkResult, error) {
	if err := compileProgram("stdio_benchmark.cpp", "stdio_benchmark"); err != nil {
		return nil, err
	}
	defer exec.Command("rm", "stdio_benchmark").Run()

	cmd := exec.Command("./stdio_benchmark")
	stdin, err := cmd.StdinPipe()
	if err != nil {
		return nil, fmt.Errorf("failed to create stdin pipe: %v", err)
	}

	writer := func(size interface{}) error {
		if _, err := fmt.Fprintf(stdin, "%d\n", size); err != nil {
			return fmt.Errorf("failed to write size to stdin: %v", err)
		}
		if _, err := stdin.Write([]byte(strings.Repeat("0", dataSize))); err != nil {
			return fmt.Errorf("failed to write data to stdin: %v", err)
		}
		return stdin.Close()
	}

	return runBenchmark(cmd, writer)
}

func namedPipeBenchmark() (*BenchmarkResult, error) {
	if err := compileProgram("named_pipe_benchmark.cpp", "named_pipe_benchmark"); err != nil {
		return nil, err
	}
	defer exec.Command("rm", "named_pipe_benchmark").Run()

	if err := syscall.Mkfifo(namedPipePath, 0666); err != nil {
		return nil, fmt.Errorf("failed to create named pipe: %v", err)
	}
	defer os.Remove(namedPipePath)

	cmd := exec.Command("./named_pipe_benchmark", namedPipePath)

	writer := func(size interface{}) error {
		pipe, err := os.OpenFile(namedPipePath, os.O_WRONLY, os.ModeNamedPipe)
		if err != nil {
			return fmt.Errorf("failed to open named pipe: %v", err)
		}
		defer pipe.Close()

		if _, err := fmt.Fprintf(pipe, "%d\n", size); err != nil {
			return fmt.Errorf("failed to write size to pipe: %v", err)
		}
		if _, err := pipe.Write([]byte(strings.Repeat("0", dataSize))); err != nil {
			return fmt.Errorf("failed to write data to pipe: %v", err)
		}
		return nil
	}

	return runBenchmark(cmd, writer)
}

func printResult(name string, result *BenchmarkResult) {
	fmt.Printf("%s Benchmark Results:\n", name)
	fmt.Printf("Hash: %s\n", result.Hash)
	fmt.Printf("Time: %.2f micro seconds\n", result.Time)
	fmt.Printf("Throughput: %.2f GB/s\n\n", result.Throughput)
}

func main() {
	stdioResult, err := stdioBenchmark()
	if err != nil {
		fmt.Fprintf(os.Stderr, "STDIO Benchmark Error: %v\n", err)
		os.Exit(1)
	}
	printResult("STDIO", stdioResult)

	namedPipeResult, err := namedPipeBenchmark()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Named Pipe Benchmark Error: %v\n", err)
		os.Exit(1)
	}
	printResult("Named Pipe", namedPipeResult)
}
