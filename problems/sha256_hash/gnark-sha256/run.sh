#!/bin/bash

go mod -C problems/sha256_hash/gnark-sha256 tidy
go mod -C problems/sha256_hash/SPJ tidy
go build -C problems/sha256_hash/gnark-sha256
go build -C problems/sha256_hash/SPJ

problems/sha256_hash/SPJ/SPJ -cpu 16 -largestN 4096 -memory 32768 -prover "problems/sha256_hash/gnark-sha256/gnark-sha256 -mode prove" -time 1200 -verifier "problems/sha256_hash/gnark-sha256/gnark-sha256 -mode verify" -json "spj_output/sha256_hash/result.json"