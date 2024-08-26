# Halo2 Keccak Circuit Documentation

__Acknowledgement__: the circuit of this repo is developed by scroll https://github.com/scroll-tech/zkevm-circuits

## Overview

This project implements a Keccak (SHA3) hash function circuit using the Halo2 zero-knowledge proof system. It includes components for circuit definition, proving, and verification.

## Key Components

### 1. Circuit Definition (`circuit.rs`)

The `KeccakCircuit` struct defines the circuit for Keccak hash computation. It supports multiple hash operations in a single circuit.

Key features:
- Supports up to `MAX_NUM_HASHES` (136) Keccak hash operations.
- Uses the `halo2_proofs` and `zkevm_circuits` libraries.
- Implements the `Circuit<Fr>` trait for Halo2 compatibility.

### 2. Configuration (`config.rs`)

Defines the `KeccakBenchConfig` struct, which configures the Keccak circuit for benchmarking.

### 3. Constants (`lib.rs`)

Defines important constants:
- `LOG_DEGREE`: Log2 of the number of rows in the circuit (20).
- `NUM_ROUNDS`: Number of Keccak-f rounds per hash (24).
- `NUM_ROWS_PER_ROUND`: Number of Halo2 rows required per Keccak round (300).
- `MAX_NUM_HASHES`: Maximum number of hashes supported (136).

### 4. Prover (`prover.rs`)

Implements the proving system:
- Generates and manages the Structured Reference String (SRS).
- Creates proving and verification keys.
- Generates proofs for given inputs.
- Communicates with a Special Judge (SPJ) through named pipes.

### 5. Verifier (`verifier.rs`)

Implements the verification system:
- Reads proof, verification key, and public inputs from the SPJ.
- Verifies the proof using the Halo2 verification algorithm.
- Supports batch verification (default 1000 times) for performance measurement.

### 6. Tests (`tests.rs`)

Includes unit tests for the Keccak circuit:
- `test_keccak_with_mock_prover`: Uses Halo2's `MockProver` for circuit correctness.
- `test_keccak_with_real_prover`: Generates and verifies a real proof.

## Usage

### Prover

Run the prover with:

```
cargo run --release --bin prover <spj_to_prover_pipe> <prover_to_spj_pipe>
```

The prover:
1. Reads inputs from the SPJ.
2. Generates a proof.
3. Sends the proof, verification key, and public inputs back to the SPJ.

### Verifier

Run the verifier with:

```
cargo run --release --bin verifier <spj_to_verifier_pipe> <verifier_to_spj_pipe>
```

The verifier:
1. Reads the proof, verification key, and public inputs from the SPJ.
2. Verifies the proof.
3. Sends the verification result back to the SPJ.

## Performance Considerations

- The circuit supports up to 136 Keccak hash operations in a single proof.
- The verifier performs 1000 verifications to amortize the SRS loading time.
- Both prover and verifier use file-based logging for debugging and performance analysis.

## Dependencies

- `halo2_proofs`: Core library for the Halo2 proving system.
- `halo2curves`: Provides the BN256 curve implementation.
- `zkevm_circuits`: Contains the Keccak circuit implementation.
- `snark_verifier_sdk`: SDK for SNARK generation and verification.
- `tiny_keccak`: Keccak hash implementation for reference computations.

## Note

This implementation is designed for benchmarking and demonstration purposes. Ensure proper security audits and optimizations before using in a production environment.