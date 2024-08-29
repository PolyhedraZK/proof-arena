#!/bin/bash

# execute me at the [proof-area] directory, trigger CI manually via including [script:problems/keccak256_hash/plonky3-pcbin/run.sh]

set -x  # Enable command echoing for debugging

# Remove old pipes and log file
rm -f /tmp/spj_to_prover /tmp/prover_to_spj /tmp/spj_to_verifier /tmp/verifier_to_spj 

# build go SPJ
go mod -C problems/keccak256_hash/expectedProver tidy
go mod -C problems/keccak256_hash/SPJ tidy
go build -C problems/keccak256_hash/expectedProver
go build -C problems/keccak256_hash/SPJ

# Build Rust
pushd $PWD && \
cd problems/keccak256_hash/plonky3-pcbin/proof-cloud-bin-prover/plonky3-keccak-serve && \
RUSTFLAGS="-Ctarget-cpu=native" cargo build --release --features parallel && \
popd

pushd $PWD && \
cd problems/keccak256_hash/plonky3-pcbin/proof-cloud-bin-prover/proof-arena-integration && \
RUSTFLAGS="-Ctarget-cpu=native" cargo build --release && \
popd

cp problems/keccak256_hash/plonky3-pcbin/proof-cloud-bin-prover/plonky3-keccak-serve/target/release/plonky3-keccak-serve problems/keccak256_hash/plonky3-pcbin/plonky3-keccak-serve
cp problems/keccak256_hash/plonky3-pcbin/proof-cloud-bin-prover/proof-arena-integration/target/release/proof-arena-integration problems/keccak256_hash/plonky3-pcbin/proof-arena-integration

# Run the SPJ
problems/keccak256_hash/SPJ/SPJ -cpu 64 -largestN 1365 \
  -memory 32768 -time 1200 \
  -json "spj_output/keccak256_hash/plonky3-pcbin.json" \
  -prover "problems/keccak256_hash/plonky3-pcbin/proof-arena-integration problems/keccak256_hash/plonky3-pcbin/plonky3-keccak-serve prove 1365" \
  -verifier "problems/keccak256_hash/plonky3-pcbin/proof-arena-integration problems/keccak256_hash/plonky3-pcbin/plonky3-keccak-serve verify 10"

# Capture the exit status
exit_status=$?

# Clean up pipes
rm -f /tmp/spj_to_prover /tmp/prover_to_spj /tmp/spj_to_verifier /tmp/verifier_to_spj

# Output debug information
echo "SPJ exit status: $exit_status"

exit $exit_status
