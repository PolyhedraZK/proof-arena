package SPJ

import (
	"fmt"
	"os"

	ipc "github.com/PolyhedraZK/proof-arena/SPJ/IPCUtils"
)

type PipeManager struct {
	pipes map[string]*os.File
}

func NewPipeManager() (*PipeManager, error) {
	pipeNames := []string{"spj_to_prover", "prover_to_spj", "spj_to_verifier", "verifier_to_spj"}
	pm := &PipeManager{pipes: make(map[string]*os.File)}

	for _, name := range pipeNames {
		pipe, err := ipc.CreatePipe("/tmp/"+name, 0666)
		if err != nil {
			pm.Close()
			return nil, fmt.Errorf("error creating %s pipe: %w", name, err)
		}
		pm.pipes[name] = pipe
	}

	return pm, nil
}

func (pm *PipeManager) Close() {
	for name, pipe := range pm.pipes {
		pipe.Close()
		os.Remove("/tmp/" + name)
	}
}

func (pm *PipeManager) GetProverPipeNames() ([]string, error) {
	return []string{"/tmp/spj_to_prover", "/tmp/prover_to_spj"}, nil
}

func (pm *PipeManager) GetVerifierPipeNames() ([]string, error) {
	return []string{"/tmp/spj_to_verifier", "/tmp/verifier_to_spj"}, nil
}

func (pm *PipeManager) ReadStringFromProver() (string, error) {
	return ipc.Read_string(pm.pipes["prover_to_spj"])
}

func (pm *PipeManager) SendToProver(data []byte) error {
	return ipc.Write_byte_array(pm.pipes["spj_to_prover"], data)
}

func (pm *PipeManager) ReadFromProver() ([]byte, error) {
	return ipc.Read_byte_array(pm.pipes["prover_to_spj"])
}

func (pm *PipeManager) WaitForProverMessage(expected string) error {
	message, err := ipc.Read_string(pm.pipes["prover_to_spj"])
	if err != nil {
		return err
	}
	if message != expected {
		return fmt.Errorf("expected '%s', got '%s'", expected, message)
	}
	return nil
}

func (pm *PipeManager) SendToVerifier(data []byte) error {
	return ipc.Write_byte_array(pm.pipes["spj_to_verifier"], data)
}

func (pm *PipeManager) ReadFromVerifier() ([]byte, error) {
	return ipc.Read_byte_array(pm.pipes["verifier_to_spj"])
}

func (pm *PipeManager) ReadUint64FromProver() (uint64, error) {
	return ipc.Read_uint64(pm.pipes["prover_to_spj"])
}
