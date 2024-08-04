package main

import (
	"fmt"
	"os/exec"
	"strconv"
	"strings"
	"syscall"
	"time"
)

func monitorResources(pid int, limits ProblemRequirement, done chan bool) (int, error) {
	peakMemory := 0
	startTime := time.Now()

	for {
		select {
		case <-done:
			return peakMemory, nil
		default:
			cmd := exec.Command("ps", "-o", "rss=,pcpu=", "-p", strconv.Itoa(pid))
			output, err := cmd.Output()
			if err != nil {
				return 0, fmt.Errorf("program unexpectedly terminated")
			}

			fields := strings.Fields(string(output))
			if len(fields) < 2 {
				return 0, fmt.Errorf("unexpected ps output format")
			}

			currentMemory, err := strconv.Atoi(fields[0])
			if err != nil {
				return 0, fmt.Errorf("failed to parse memory usage: %v", err)
			}

			cpuUsage, err := strconv.ParseFloat(fields[1], 64)
			if err != nil {
				return 0, fmt.Errorf("failed to parse CPU usage: %v", err)
			}

			if currentMemory > peakMemory {
				peakMemory = currentMemory
			}

			// Check memory limit (convert MB to KB)
			if limits.MemoryLimit > 0 && peakMemory > limits.MemoryLimit*1024 {
				syscall.Kill(pid, syscall.SIGKILL)
				return peakMemory, fmt.Errorf("memory limit exceeded")
			}

			// Check CPU limit
			if limits.CPULimit > 0 && cpuUsage > float64(limits.CPULimit) {
				syscall.Kill(pid, syscall.SIGKILL)
				return peakMemory, fmt.Errorf("CPU limit exceeded")
			}

			// Check time limit
			if limits.TimeLimit > 0 && time.Since(startTime).Seconds() > float64(limits.TimeLimit) {
				syscall.Kill(pid, syscall.SIGKILL)
				return peakMemory, fmt.Errorf("time limit exceeded")
			}

			time.Sleep(100 * time.Millisecond)
		}
	}
}
