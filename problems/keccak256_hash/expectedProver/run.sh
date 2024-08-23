#!/bin/bash

go mod -C problems/keccak256_hash/expectedProver tidy
go mod -C problems/keccak256_hash/SPJ tidy
go build -C problems/keccak256_hash/expectedProver
go build -C problems/keccak256_hash/SPJ

problems/keccak256_hash/SPJ/SPJ -cpu 64 -largestN 1024 -memory 1024 -prover "problems/keccak256_hash/expectedProver/expectedProver -mode prove" -time 300 -verifier "problems/keccak256_hash/expectedProver/expectedProver -mode verify" -json "spj_output/keccak256_hash/3-GNARK_KECCAK-256.json"
