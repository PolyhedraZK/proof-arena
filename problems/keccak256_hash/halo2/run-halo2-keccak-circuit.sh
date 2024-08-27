#!/bin/bash

# execute me at the [proof-area] directory

set -x  # Enable command echoing for debugging

# Remove old pipes and log file
rm -f /tmp/spj_to_prover /tmp/prover_to_spj /tmp/spj_to_verifier /tmp/verifier_to_spj 

# build rust binaries
cd problems/keccak256_hash/halo2/ && cargo build --release -p halo2_keccak_circuit && cd -

# build go SPJ
go mod -C problems/keccak256_hash/expectedProver tidy
go mod -C problems/keccak256_hash/SPJ tidy
go build -C problems/keccak256_hash/expectedProver
go build -C problems/keccak256_hash/SPJ

# Run the SPJ
problems/keccak256_hash/SPJ/SPJ -cpu 64 -largestN 136 \
  -memory 32768 -time 1200 \
  -json spj_output/keccak256_hash/Halo2-Keccak-256.json \
  -prover "problems/keccak256_hash/halo2/target/release/prover" \
  -verifier "problems/keccak256_hash/halo2/target/release/verifier"

# Capture the exit status
exit_status=$?

# Clean up pipes
rm -f /tmp/spj_to_prover /tmp/prover_to_spj /tmp/spj_to_verifier /tmp/verifier_to_spj

# Output debug information
echo "SPJ exit status: $exit_status"

exit $exit_status
