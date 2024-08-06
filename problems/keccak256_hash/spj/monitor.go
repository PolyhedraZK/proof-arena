package main

import (
	"fmt"
	"os/exec"
	"strconv"
	"strings"
	"syscall"
	"time"

	"go.uber.org/zap"
)

func monitorResources(pid int, limits ProblemRequirement, done chan bool, logger *zap.Logger) (int, error) {
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
				logger.Error("Program unexpectedly terminated", zap.Error(err))
				return 0, fmt.Errorf("program unexpectedly terminated")
			}

			fields := strings.Fields(string(output))
			if len(fields) < 2 {
				logger.Error("Unexpected ps output format", zap.String("output", string(output)))
				return 0, fmt.Errorf("unexpected ps output format")
			}

			currentMemory, err := strconv.Atoi(fields[0])
			if err != nil {
				logger.Error("Failed to parse memory usage", zap.Error(err))
				return 0, fmt.Errorf("failed to parse memory usage: %v", err)
			}

			cpuUsage, err := strconv.ParseFloat(fields[1], 64)
			if err != nil {
				logger.Error("Failed to parse CPU usage", zap.Error(err))
				return 0, fmt.Errorf("failed to parse CPU usage: %v", err)
			}

			if currentMemory > peakMemory {
				peakMemory = currentMemory
			}

			if limits.MemoryLimit > 0 && peakMemory > limits.MemoryLimit*1024 {
				logger.Warn("Memory limit exceeded", zap.Int("peakMemory", peakMemory), zap.Int("limit", limits.MemoryLimit*1024))
				syscall.Kill(pid, syscall.SIGKILL)
				return peakMemory, fmt.Errorf("memory limit exceeded")
			}

			if limits.CPULimit > 0 && cpuUsage > float64(limits.CPULimit) {
				logger.Warn("CPU limit exceeded", zap.Float64("cpuUsage", cpuUsage), zap.Int("limit", limits.CPULimit))
				syscall.Kill(pid, syscall.SIGKILL)
				return peakMemory, fmt.Errorf("CPU limit exceeded")
			}

			if limits.TimeLimit > 0 && time.Since(startTime).Seconds() > float64(limits.TimeLimit) {
				logger.Warn("Time limit exceeded", zap.Duration("elapsed", time.Since(startTime)), zap.Int("limit", limits.TimeLimit))
				syscall.Kill(pid, syscall.SIGKILL)
				return peakMemory, fmt.Errorf("time limit exceeded")
			}

			time.Sleep(100 * time.Millisecond)
		}
	}
}
