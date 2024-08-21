package SPJ

import (
	"sync"
	"time"
)

type Timer struct {
	times map[string]time.Duration
	start map[string]time.Time
	mutex sync.Mutex
}

func NewTimer() *Timer {
	return &Timer{
		times: make(map[string]time.Duration),
		start: make(map[string]time.Time),
	}
}

func (t *Timer) Start(name string) {
	t.mutex.Lock()
	defer t.mutex.Unlock()
	t.start[name] = time.Now()
}

func (t *Timer) Stop(name string) {
	t.mutex.Lock()
	defer t.mutex.Unlock()
	if startTime, ok := t.start[name]; ok {
		t.times[name] = time.Since(startTime)
		delete(t.start, name)
	}
}

func (t *Timer) GetTimes() map[string]time.Duration {
	t.mutex.Lock()
	defer t.mutex.Unlock()
	return t.times
}
