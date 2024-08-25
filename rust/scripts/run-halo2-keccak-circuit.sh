#!/bin/bash

set -x  # Enable command echoing for debugging

# Remove old pipes and log file
rm -f /tmp/spj_to_prover /tmp/prover_to_spj /tmp/spj_to_verifier /tmp/verifier_to_spj 

# Create pipes
mkfifo /tmp/spj_to_prover /tmp/spj_to_verifier 

# # Set permissions
# chmod 666 /tmp/spj_to_prover /tmp/prover_to_spj /tmp/spj_to_verifier /tmp/verifier_to_spj

# Ensure pipes are created
ls -l /tmp/spj_to_prover /tmp/spj_to_verifier 

# build rust binaries
cd ../../ && cargo build --release && cd -

# build go SPJ
cd ../../problems/keccak256_hash/SPJ && go build && cd -

# Run the SPJ
../../problems/keccak256_hash/SPJ/SPJ -cpu 16 -largestN 136 \
  -json ../../spj_output/keccak256_hash/Halo2-Keccak-256.json \
  -prover "../../target/release/prover /tmp/spj_to_prover /tmp/prover_to_spj" \
  -memory 32768 -time 1200 \
  -verifier "../../target/release/verifier /tmp/spj_to_verifier /tmp/verifier_to_spj"

# Capture the exit status
exit_status=$?

# Clean up pipes
rm /tmp/spj_to_prover /tmp/prover_to_spj /tmp/spj_to_verifier /tmp/verifier_to_spj

# Output debug information
echo "SPJ exit status: $exit_status"

exit $exit_status