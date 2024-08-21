package SPJ

import (
	"context"
	"fmt"
	"runtime"
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

	_, _, errno := unix.RawSyscall(unix.SYS_SCHED_SETAFFINITY, uintptr(pid), unsafe.Sizeof(mask), uintptr(unsafe.Pointer(&mask)))
	if errno != 0 {
		return fmt.Errorf("failed to set CPU affinity: %v", errno)
	}

	return nil
}

func (rm *ResourceMonitor) UpdateMemoryUsage() error {
	var rusage unix.Rusage
	err := unix.Getrusage(unix.RUSAGE_SELF, &rusage)
	if err != nil {
		return fmt.Errorf("failed to get resource usage: %w", err)
	}

	currentRSS := uint64(rusage.Maxrss) * 1024 // Maxrss is in kilobytes

	if currentRSS > rm.peakRSS {
		rm.peakRSS = currentRSS
	}

	rm.lastRSS = currentRSS
	return nil
}

func (rm *ResourceMonitor) GetPeakMemory() uint64 {
	return rm.peakRSS
}

func (rm *ResourceMonitor) GetCurrentMemory() uint64 {
	return rm.lastRSS
}

func (rm *ResourceMonitor) StartPeriodicUpdate(ctx context.Context, interval time.Duration) chan struct{} {
	done := make(chan struct{})
	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				rm.UpdateMemoryUsage()
			case <-ctx.Done():
				close(done)
				return
			}
		}
	}()
	return done
}
