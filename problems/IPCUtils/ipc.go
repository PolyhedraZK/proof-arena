package ipc

import (
	"encoding/binary"
	"fmt"
	"io"
	"os"
	"syscall"
)

func Read_exact(r io.Reader, b []byte) error {
	n := 0
	for n < len(b) {
		m, err := r.Read(b[n:])
		if err != nil {
			return err
		}
		n += m
	}
	return nil
}

func Write_byte_array(w io.Writer, b []byte) error {
	Write_uint64(w, uint64(len(b)))
	_, err := w.Write(b)
	if err != nil {
		return err
	}
	return nil
}

func Write_uint64(w io.Writer, x uint64) error {
	b := make([]byte, 8)
	binary.LittleEndian.PutUint64(b, x)
	_, err := w.Write(b)
	return err
}

func Read_uint64(r io.Reader) (uint64, error) {
	b := make([]byte, 8)
	err := Read_exact(r, b)
	if err != nil {
		return 0, err
	}
	return binary.LittleEndian.Uint64(b), nil
}

func Read_byte_array(r io.Reader) ([]byte, error) {
	length, err := Read_uint64(r)
	if err != nil {
		return nil, err
	}
	// try allocating a huge amount of memory
	// 128GB limit
	if length > 1<<37 {
		return nil, fmt.Errorf("byte array too large")
	}
	b := make([]byte, length)
	err = Read_exact(r, b)
	return b, err
}

func Write_string(w io.Writer, s string) error {
	b := []byte(s)
	return Write_byte_array(w, b)
}

func Read_string(r io.Reader) (string, error) {
	b, err := Read_byte_array(r)
	return string(b), err
}

func CreatePipe(pipePath string, perm os.FileMode) (*os.File, error) {
	// Check if the pipe already exists
	_, err := os.Stat(pipePath)
	if err == nil {
		// Pipe already exists, remove it
		err = os.Remove(pipePath)
		if err != nil {
			return nil, fmt.Errorf("failed to remove existing pipe: %v", err)
		}
	} else if !os.IsNotExist(err) {
		// An error occurred that wasn't "file not found"
		return nil, fmt.Errorf("failed to check for existing pipe: %v", err)
	}

	// Create the named pipe
	err = syscall.Mkfifo(pipePath, uint32(perm))
	if err != nil {
		return nil, fmt.Errorf("failed to create named pipe: %v", err)
	}

	// Set the correct permissions
	err = os.Chmod(pipePath, perm)
	if err != nil {
		// If chmod fails, try to remove the pipe
		os.Remove(pipePath)
		return nil, fmt.Errorf("failed to set permissions on pipe: %v", err)
	}

	file, err := os.OpenFile(pipePath, os.O_RDWR, os.ModeNamedPipe)
	if err != nil {
		return nil, fmt.Errorf("failed to open named pipe: %v", err)
	}

	return file, nil
}
