package main

import (
	"bufio"
	"fmt"
	"os"
	"os/exec"
	"strconv"
	"strings"
)

func stdioBenchmark() (float64, error) {

	moveCmd := exec.Command("mv", "stdio_benchmark.cpp.txt", "stdio_benchmark.cpp")
	moveBackCmd := exec.Command("mv", "stdio_benchmark.cpp", "stdio_benchmark.cpp.txt")
	// Compile the C++ program
	compileCmd := exec.Command("g++", "stdio_benchmark.cpp", "-o", "stdio_benchmark", "-O3")
	deleteCmd := exec.Command("rm", "stdio_benchmark")
	err := moveCmd.Run()
	if err != nil {
		return 0, fmt.Errorf("failed to move file: %v", err)
	}
	err = compileCmd.Run()
	if err != nil {
		return 0, fmt.Errorf("failed to compile: %v", err)
	}
	err = moveBackCmd.Run()
	if err != nil {
		return 0, fmt.Errorf("failed to move file back: %v", err)
	}

	N := 1024 * 1024 * 1024 // 1 GB

	// Start the benchmark program
	cmd := exec.Command("./stdio_benchmark")
	stdin, err := cmd.StdinPipe()
	if err != nil {
		return 0, fmt.Errorf("failed to create stdin pipe: %v", err)
	}
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return 0, fmt.Errorf("failed to create stdout pipe: %v", err)
	}
	err = cmd.Start()
	if err != nil {
		return 0, fmt.Errorf("failed to start program: %v", err)
	}

	// Write N to stdin
	_, err = fmt.Fprintf(stdin, "%d\n", N)
	if err != nil {
		return 0, fmt.Errorf("failed to write N to stdin: %v", err)
	}

	// Write N bytes to stdin
	_, err = stdin.Write([]byte(strings.Repeat("0", N)))
	if err != nil {
		return 0, fmt.Errorf("failed to write data to stdin: %v", err)
	}
	stdin.Close()

	// Read hash and time from stdout
	scanner := bufio.NewScanner(stdout)
	scanner.Scan()
	hash := scanner.Text()
	scanner.Scan()
	timeStr := scanner.Text()

	err = cmd.Wait()
	if err != nil {
		return 0, fmt.Errorf("program exited with error: %v", err)
	}

	fmt.Printf("hash: %s\n", hash)
	fmt.Printf("time: %s micro seconds\n", timeStr)

	timeFloat, err := strconv.ParseFloat(timeStr, 64)
	if err != nil {
		return 0, fmt.Errorf("failed to parse time: %v", err)
	}

	timeSeconds := timeFloat / 1000 / 1000
	throughput := float64(N) / timeSeconds / 1024 / 1024 / 1024
	fmt.Printf("throughput: %.2f GB/s\n", throughput)

	deleteCmd.Run()

	return throughput, nil
}

func main() {
	throughput, err := stdioBenchmark()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
	fmt.Printf("Final throughput: %.2f GB/s\n", throughput)
}
