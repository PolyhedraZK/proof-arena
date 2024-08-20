package SPJ

import "time"

type Timer struct {
	times map[string]time.Duration
	start map[string]time.Time
}

func NewTimer() *Timer {
	return &Timer{
		times: make(map[string]time.Duration),
		start: make(map[string]time.Time),
	}
}

func (t *Timer) Start(name string) {
	t.start[name] = time.Now()
}

func (t *Timer) Stop(name string) {
	if startTime, ok := t.start[name]; ok {
		t.times[name] = time.Since(startTime)
		delete(t.start, name)
	}
}

func (t *Timer) GetTimes() map[string]time.Duration {
	return t.times
}
