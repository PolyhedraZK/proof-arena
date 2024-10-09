#!/bin/bash

# execute me at the [proof-area] directory, trigger CI manually via including [script:problems/keccak256_hash/plonky3-pcbin/run.sh]

set -x  # Enable command echoing for debugging

# Remove old pipes and log file
RUSTFLAGS="-C target-cpu=native" cargo build --release 
