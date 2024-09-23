package ipc

import (
	"encoding/binary"
	"fmt"
	"io"
	"os"
	"syscall"
)

// Read_exact reads exactly len(b) bytes from the reader r into the byte slice b.
// It returns an error if it encounters any issues during the read operation.
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

// Write_byte_array writes the length of the byte array b followed by the byte array itself to the writer w.
// It returns an error if it encounters any issues during the write operation.
func Write_byte_array(w io.Writer, b []byte) error {
	Write_uint64(w, uint64(len(b)))
	_, err := w.Write(b)
	if err != nil {
		return err
	}
	return nil
}

// Write_uint64 writes the uint64 value x to the writer w in little-endian format.
// It returns an error if it encounters any issues during the write operation.
func Write_uint64(w io.Writer, x uint64) error {
	b := make([]byte, 8)
	binary.LittleEndian.PutUint64(b, x)
	_, err := w.Write(b)
	return err
}

// Read_uint64 reads a uint64 value from the reader r in little-endian format.
// It returns the read value and an error if it encounters any issues during the read operation.
func Read_uint64(r io.Reader) (uint64, error) {
	b := make([]byte, 8)
	err := Read_exact(r, b)
	if err != nil {
		return 0, err
	}
	return binary.LittleEndian.Uint64(b), nil
}

// Read_byte_array reads a byte array from the reader r.
// It first reads the length of the array and then reads the array itself.
// It returns the read byte array and an error if it encounters any issues during the read operation.
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

// Write_string writes the string s to the writer w.
// It converts the string to a byte array and then writes it using Write_byte_array.
// It returns an error if it encounters any issues during the write operation.
func Write_string(w io.Writer, s string) error {
	b := []byte(s)
	return Write_byte_array(w, b)
}

// Read_string reads a string from the reader r.
// It reads a byte array using Read_byte_array and then converts it to a string.
// It returns the read string and an error if it encounters any issues during the read operation.
func Read_string(r io.Reader) (string, error) {
	b, err := Read_byte_array(r)
	return string(b), err
}

// CreatePipe creates a named pipe (FIFO) at the specified path with the given permissions.
// If a pipe already exists at the path, it removes it before creating a new one.
// It returns a file handle to the created pipe and an error if it encounters any issues during the creation or opening of the pipe.
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
