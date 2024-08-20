package SPJ

import (
	"fmt"
	"os"

	ipc "github.com/PolyhedraZK/proof-arena/SPJ/IPCUtils"
)

type PipeManager struct {
	SpjToProverPipe   *os.File
	ProverToSPJPipe   *os.File
	SpjToVerifierPipe *os.File
	VerifierToSPJPipe *os.File
}

func NewPipeManager() (*PipeManager, error) {
	spjToProverPipe, err := ipc.CreatePipe("/tmp/spj_to_prover", 0666)
	if err != nil {
		return nil, fmt.Errorf("error creating spj to prover pipe: %v", err)
	}

	proverToSPJPipe, err := ipc.CreatePipe("/tmp/prover_to_spj", 0666)
	if err != nil {
		return nil, fmt.Errorf("error creating prover to spj pipe: %v", err)
	}

	spjToVerifierPipe, err := ipc.CreatePipe("/tmp/spj_to_verifier", 0666)
	if err != nil {
		return nil, fmt.Errorf("error creating spj to verifier pipe: %v", err)
	}

	verifierToSPJPipe, err := ipc.CreatePipe("/tmp/verifier_to_spj", 0666)
	if err != nil {
		return nil, fmt.Errorf("error creating verifier to spj pipe: %v", err)
	}

	return &PipeManager{
		SpjToProverPipe:   spjToProverPipe,
		ProverToSPJPipe:   proverToSPJPipe,
		SpjToVerifierPipe: spjToVerifierPipe,
		VerifierToSPJPipe: verifierToSPJPipe,
	}, nil
}

func (pm *PipeManager) Close() {
	pm.SpjToProverPipe.Close()
	pm.ProverToSPJPipe.Close()
	pm.SpjToVerifierPipe.Close()
	pm.VerifierToSPJPipe.Close()
	os.Remove("/tmp/spj_to_prover")
	os.Remove("/tmp/prover_to_spj")
	os.Remove("/tmp/spj_to_verifier")
	os.Remove("/tmp/verifier_to_spj")
}

func (pm *PipeManager) SendPipeNames() error {
	if err := ipc.Write_string(os.Stdout, "/tmp/spj_to_prover"); err != nil {
		return err
	}
	if err := ipc.Write_string(os.Stdout, "/tmp/prover_to_spj"); err != nil {
		return err
	}
	return nil
}

func (pm *PipeManager) ReadStringFromProver() (string, error) {
	return ipc.Read_string(pm.ProverToSPJPipe)
}

func (pm *PipeManager) ReadUint64FromProver() (uint64, error) {
	return ipc.Read_uint64(pm.ProverToSPJPipe)
}

func (pm *PipeManager) SendToProver(data []byte) error {
	return ipc.Write_byte_array(pm.SpjToProverPipe, data)
}

func (pm *PipeManager) ReadFromProver() ([]byte, error) {
	return ipc.Read_byte_array(pm.ProverToSPJPipe)
}

func (pm *PipeManager) WaitForProverMessage(expected string) error {
	message, err := ipc.Read_string(pm.ProverToSPJPipe)
	if err != nil {
		return err
	}
	if message != expected {
		return fmt.Errorf("expected '%s', got '%s'", expected, message)
	}
	return nil
}

// Verifier related methods

func (pm *PipeManager) SendVerifierPipeNames() error {
	if err := ipc.Write_string(os.Stdout, "/tmp/spj_to_verifier"); err != nil {
		return err
	}
	if err := ipc.Write_string(os.Stdout, "/tmp/verifier_to_spj"); err != nil {
		return err
	}
	return nil
}

func (pm *PipeManager) ReadStringFromVerifier() (string, error) {
	return ipc.Read_string(pm.VerifierToSPJPipe)
}

func (pm *PipeManager) ReadUint64FromVerifier() (uint64, error) {
	return ipc.Read_uint64(pm.VerifierToSPJPipe)
}

func (pm *PipeManager) SendToVerifier(data []byte) error {
	return ipc.Write_byte_array(pm.SpjToVerifierPipe, data)
}

func (pm *PipeManager) ReadFromVerifier() ([]byte, error) {
	return ipc.Read_byte_array(pm.VerifierToSPJPipe)
}

func (pm *PipeManager) WaitForVerifierMessage(expected string) error {
	message, err := ipc.Read_string(pm.VerifierToSPJPipe)
	if err != nil {
		return err
	}
	if message != expected {
		return fmt.Errorf("expected '%s' from Verifier, got '%s'", expected, message)
	}
	return nil
}
