#!/bin/bash

# execute me at the [proof-area] directory, trigger CI manually via including [script:problems/keccak256_hash/plonky3-pcbin/run.sh]

set -x  # Enable command echoing for debugging

# Remove old pipes and log file
RUSTFLAGS="-C target-cpu=native" cargo build --release 

# Run the SPJ
# largestN = par_factor * N_hashes * 8
# par_factor is the arg after the mode arg
../SPJ/SPJ -cpu 16 -largestN 4096 \
  -memory 32768 -time 1200 \
  -json "../SPJ/expander-sha256.json" \
  -prover "target/release/expander-sha256 prove 16 256" \
  -verifier "target/release/expander-sha256 verify 16 256"

# Capture the exit status
exit_status=$?


# Output debug information
echo "SPJ exit status: $exit_status"

exit $exit_status
