#!/bin/bash

go build -C ../SPJ
go build

../SPJ/SPJ -cpu 64 -largestN 1024 -memory 1024 -prover "./expectedProver -mode prove" -time 300 -verifier "./expectedProver -mode verify" -json "../../../spj_output/keccak256_hash/3-GNARK_KECCAK-256.json"