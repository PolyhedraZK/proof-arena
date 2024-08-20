package SPJ

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"
)

type CgroupManager struct {
	cgroupPath string
}

func NewCgroupManager(name string) (*CgroupManager, error) {
	cgroupPath := filepath.Join("/sys/fs/cgroup/cpu", name)
	if err := os.Mkdir(cgroupPath, 0755); err != nil && !os.IsExist(err) {
		return nil, fmt.Errorf("failed to create cgroup: %v", err)
	}
	return &CgroupManager{cgroupPath: cgroupPath}, nil
}

func (cm *CgroupManager) SetCPULimit(numCPU int) error {
	quotaPath := filepath.Join(cm.cgroupPath, "cpu.cfs_quota_us")
	periodPath := filepath.Join(cm.cgroupPath, "cpu.cfs_period_us")

	// Set the CPU period to 100000 microseconds (100 milliseconds)
	if err := os.WriteFile(periodPath, []byte("100000"), 0644); err != nil {
		return fmt.Errorf("failed to set CPU period: %v", err)
	}

	// Set the CPU quota to (number of CPUs * period)
	quota := numCPU * 100000
	if err := os.WriteFile(quotaPath, []byte(strconv.Itoa(quota)), 0644); err != nil {
		return fmt.Errorf("failed to set CPU quota: %v", err)
	}

	return nil
}

func (cm *CgroupManager) AddProcess(pid int) error {
	tasksPath := filepath.Join(cm.cgroupPath, "tasks")
	return os.WriteFile(tasksPath, []byte(strconv.Itoa(pid)), 0644)
}

func (cm *CgroupManager) Cleanup() error {
	return os.RemoveAll(cm.cgroupPath)
}
