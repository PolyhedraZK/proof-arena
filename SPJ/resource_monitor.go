package SPJ

import (
	"fmt"
	"runtime"
	"time"

	"golang.org/x/sys/unix"
)

type ResourceMonitor struct {
	peakRSS uint64
	lastRSS uint64
}

func NewResourceMonitor() *ResourceMonitor {
	return &ResourceMonitor{}
}

func (rm *ResourceMonitor) LimitCPU(numCPU int) error {
	if numCPU <= 0 || numCPU > runtime.NumCPU() {
		return fmt.Errorf("invalid number of CPUs: %d", numCPU)
	}
	runtime.GOMAXPROCS(numCPU)
	return nil
}

func (rm *ResourceMonitor) UpdateMemoryUsage() error {
	var rusage unix.Rusage
	err := unix.Getrusage(unix.RUSAGE_SELF, &rusage)
	if err != nil {
		return fmt.Errorf("failed to get resource usage: %v", err)
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

func (rm *ResourceMonitor) StartPeriodicUpdate(interval time.Duration) chan struct{} {
	done := make(chan struct{})
	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				rm.UpdateMemoryUsage()
			case <-done:
				return
			}
		}
	}()
	return done
}
