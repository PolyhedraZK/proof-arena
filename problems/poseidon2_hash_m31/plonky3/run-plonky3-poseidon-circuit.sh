#!/bin/bash

# execute me at the [proof-area] directory

set -x  # Enable command echoing for debugging

# Remove old pipes and log file
rm -f /tmp/spj_to_prover /tmp/prover_to_spj /tmp/spj_to_verifier /tmp/verifier_to_spj 

# build rust binaries
cd problems/poseidon2_hash_m31/plonky3/ && RUSTFLAGS="-C target-cpu=native -C opt-level=3" cargo build --release && cd -

# build go SPJ
go mod -C problems/poseidon2_hash_m31/expectedProver tidy
go mod -C problems/poseidon2_hash_m31/SPJ tidy
go build -C problems/poseidon2_hash_m31/expectedProver
go build -C problems/poseidon2_hash_m31/SPJ

# Run the SPJ
problems/poseidon2_hash_m31/SPJ/SPJ -cpu 64 -largestN 136 \
  -memory 32768 -time 1200 \
  -json spj_output/poseidon2_hash_m31/Plonky3-poseidon-m31.json \
  -prover "problems/poseidon2_hash_m31/plonky3/target/release/prover" \
  -verifier "problems/poseidon2_hash_m31/plonky3/target/release/verifier"

# Capture the exit status
exit_status=$?

# Clean up pipes
rm -f /tmp/spj_to_prover /tmp/prover_to_spj /tmp/spj_to_verifier /tmp/verifier_to_spj

# Output debug information
echo "SPJ exit status: $exit_status"

exit $exit_status
