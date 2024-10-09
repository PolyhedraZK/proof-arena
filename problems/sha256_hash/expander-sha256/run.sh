#!/bin/bash

# execute me at the [proof-arena] directory

set -x  # Enable command echoing for debugging

go mod -C problems/sha256/SPJ tidy
go build -C problems/sha256/SPJ

pushd $PWD && \
cd problems/sha256/expander-sha256 && \
RUSTFLAGS="-C target-cpu=native" cargo build --release && \
popd

# Run the SPJ
# largestN = par_factor * N_hashes * 8
# par_factor is the arg after the mode arg
problems/sha256/SPJ/SPJ -cpu 16 -largestN 4096 \
  -memory 32768 -time 1200 \
  -json "spj_output/sha256/expander-sha256.json" \
  -prover "problems/sha256/expander-sha256/target/release/expander-sha256 prove 16 256" \
  -verifier "problems/sha256/expander-sha256/target/release/expander-sha256 verify 16 256"

# Capture the exit status
exit_status=$?

# Output debug information
echo "SPJ exit status: $exit_status"

exit $exit_status
