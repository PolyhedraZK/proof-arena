#!/bin/bash

# execute me at the [proof-area] directory, trigger CI manually via including [script:problems/keccak256_hash/plonky3-pcbin/run.sh]

set -x  # Enable command echoing for debugging

# Remove old pipes and log file
rm -f /tmp/spj_to_prover /tmp/prover_to_spj /tmp/spj_to_verifier /tmp/verifier_to_spj 

# build go SPJ
go mod -C problems/AXorB/expectedProver tidy
go mod -C problems/AXorB/SPJ tidy
go build -C problems/AXorB/expectedProver
go build -C problems/AXorB/SPJ

# Build Rust
pushd $PWD && \
cd problems/AXorB/stwo && \
RUSTFLAGS="-C target-cpu=native -C opt-level=3" cargo build --release && \
popd

# Run the SPJ
# largestN = par_factor * N_hashes * 8
# par_factor is the arg after the mode arg
problems/AXorB/SPJ/SPJ -cpu 64 -largestN 16 \
  -memory 32768 -time 1200 \
  -json "spj_output/AXorB/stwo.json" \
  -prover "problems/AXorB/stwo/target/release/stwo-xor-prover prove" \
  -verifier "problems/AXorB/stwo/target/release/stwo-xor-prover verify"

# Capture the exit status
exit_status=$?

# Clean up pipes
rm -f /tmp/spj_to_prover /tmp/prover_to_spj /tmp/spj_to_verifier /tmp/verifier_to_spj

# Output debug information
echo "SPJ exit status: $exit_status"

exit $exit_status
