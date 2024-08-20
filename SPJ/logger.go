package SPJ

import (
	"fmt"
	"io"
	"time"
)

type Logger struct {
	output io.Writer
}

func NewLogger(output io.Writer) *Logger {
	return &Logger{output: output}
}

func (l *Logger) Log(message string) {
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	fmt.Fprintf(l.output, "[%s] %s\n", timestamp, message)
}
