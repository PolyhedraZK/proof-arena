package SPJ

import (
	"context"
	"fmt"
	"os/exec"
	"runtime"
	"strconv"
	"strings"
	"time"
	"unsafe"

	"golang.org/x/sys/unix"
)

type ResourceMonitor struct {
	peakRSS uint64
	lastRSS uint64
}

func NewResourceMonitor() *ResourceMonitor {
	return &ResourceMonitor{}
}

func (rm *ResourceMonitor) SetCPUAffinity(pid int, numCPU int) error {
	if runtime.GOOS != "linux" {
		return fmt.Errorf("setCPUAffinity is only supported on Linux")
	}

	var mask uint64
	for i := 0; i < numCPU; i++ {
		mask |= 1 << i
	}

	_, _, errno := unix.RawSyscall(203, uintptr(pid), unsafe.Sizeof(mask), uintptr(unsafe.Pointer(&mask)))
	if errno != 0 {
		return fmt.Errorf("failed to set CPU affinity: %v", errno)
	}

	return nil
}

func (rm *ResourceMonitor) UpdateMemoryUsage(pid int) error {
	cmd := exec.Command("ps", "-o", "rss=,pcpu=", "-p", strconv.Itoa(pid), "--ppid", strconv.Itoa(pid))
	output, err := cmd.Output()
	if err != nil {
		return fmt.Errorf("failed to execute ps command: %v", err)
	}

	lines := strings.Split(strings.TrimSpace(string(output)), "\n")
	var totalRSS uint64

	for _, line := range lines {
		fields := strings.Fields(line)
		if len(fields) < 2 {
			return fmt.Errorf("unexpected ps output format")
		}

		currentMemory, err := strconv.ParseUint(fields[0], 10, 64)
		if err != nil {
			return fmt.Errorf("failed to parse memory usage: %v", err)
		}

		totalRSS += currentMemory
	}

	if totalRSS > rm.peakRSS {
		rm.peakRSS = totalRSS
	}

	rm.lastRSS = totalRSS
	return nil
}

func (rm *ResourceMonitor) GetPeakMemory() uint64 {
	return rm.peakRSS
}

func (rm *ResourceMonitor) GetCurrentMemory() uint64 {
	return rm.lastRSS
}

func (rm *ResourceMonitor) StartPeriodicUpdate(ctx context.Context, interval time.Duration, pid int) chan struct{} {
	done := make(chan struct{})
	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				rm.UpdateMemoryUsage(pid)
			case <-ctx.Done():
				close(done)
				return
			}
		}
	}()
	return done
}
