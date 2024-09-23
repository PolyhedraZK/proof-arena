---
problem_id: 4
title: Poseidon2 Hash M31
description: Poseidon2 Hash M31
draft: false
enable_comments: true
proposer: Polyhedra Network
proposer_icon: /assets/avatars/user_p.svg
---

## Problem Description

In this problem, your prover is required to generate a proof for the Poseidon2 hash function over Mersenee prime field mod $2^{31}-1$. The Poseidon2 hash function is a cryptographic hash function that takes an 512-bit input and produces a 256-bit output. The challenge will benchmark the performance of your prover in generating a proof for the Poseidon2 M31 hash function.

## Poseidon2 M31 Hash Function

We provide the standard Poseidon2 M31 hash function for this problem as your reference [here](https://github.com/PolyhedraZK/ExpanderCompilerCollection/blob/master/poseidon/poseidon.go). You can use it to generate the expected output for the given input.

## Instructions

Your prover program must read bytes from stdin and print bytes to stdout. We will use a special judge program (SPJ) to interact with your prover by providing inputs and checking outputs. The SPJ communicates with the prover through the prover's stdin and stdout. Additionally, the SPJ will invoke your verifier to check your proof.

For detailed instructions on how to interact with the SPJ, refer to the [How to Interact with SPJ](https://github.com/PolyhedraZK/proof-arena/blob/main/docs/how_to_interact_with_SPJ.md) document.

### How to calculate the expected output

- **Hash the Data:**
  - For each 64-byte block, compute the Poseidon hash, resulting in a 32-byte output.
  - The prover sends the hash results to the SPJ.

## How to submit your solution?

- You need to submit a binary prover file that matches our requirements.
- You need to submit the source code of your verifier code that matches our requirements. The code will be reviewed and published on the website.

## Benchmark Details

We run the benchmark with N instances (represented as Instance Number in the table below) of the problem. The setup time, witness generation time, proof generation time are all averaged over N instances. We run verifier with single threaded execution, repeated multiple times and averaged over multiple runs.

- Setup time: the time before step 5 starts.
- Witness generation time: the time between end of step 5 and step 7.
- Proof generation time: the time between end of step 5 and step 8.
- Verification time: running time between end of step 8 and step 11.
- Peak memory: the peak memory usage of your program.
- Proof size: the byte length of the `YOUR PROOF BYTES` and `YOUR VERIFICATION KEY BYTES`. Your verifier will be audited, so please don't include any unnecessary data in the `YOUR PUBLIC INPUT BYTES`.
