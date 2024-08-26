#!/bin/bash

set -x  # Enable command echoing for debugging

# Remove old pipes and log file
rm -f /tmp/spj_to_prover /tmp/prover_to_spj /tmp/spj_to_verifier /tmp/verifier_to_spj 

# build rust binaries
cargo build --release -p halo2_xor_circuit

# build go SPJ
go mod -C problems/AXorB/expectedProver tidy
go mod -C problems/AXorB/SPJ tidy
go build -C problems/AXorB/expectedProver
go build -C problems/AXorB/SPJ



# Run the SPJ
problems/AXorB/SPJ/SPJ -cpu 16 -largestN 136 \
  -memory 32768 -time 1200 \
  -json spj_output/AXorB/Halo2-Xor-256.json \
  -prover "target/release/prover" \
  -verifier "target/release/verifier"

# Capture the exit status
exit_status=$?

# Clean up pipes
rm -f /tmp/spj_to_prover /tmp/prover_to_spj /tmp/spj_to_verifier /tmp/verifier_to_spj

# Output debug information
echo "SPJ exit status: $exit_status"

exit $exit_status