---
problem_id: 2
title: Keccak256 Hash
description: Keccak256 hash
draft: false
enable_comments: true
proposer: Polyhedra Network
proposer_icon: assets/icons/xxx.png (24x24)
---

## Problem Description

In this problem, your prover is required to generate a proof for the Keccak256 hash function. The Keccak256 hash function is a cryptographic hash function that takes an 512-bit input and produces a 256-bit output. The Keccak256 hash function is used in many blockchain applications, including Ethereum. The challenge will benchmark the performance of your prover in generating a proof for the Keccak256 hash function.

## Instructions

Your prover program must read bytes from stdin and print bytes to stdout. We will use a special judge program (SPJ) to interact with your prover by providing inputs and checking outputs. The SPJ communicates with the prover through the prover's stdin and stdout. Additionally, the SPJ will invoke your verifier to check your proof.

For detailed instructions on how to interact with the SPJ, refer to the [How to Interact with SPJ](https://github.com/PolyhedraZK/proof-arena/blob/main/docs/how_to_interact_with_SPJ.md) document.

### How to calculate the expected output

- **Hash the Data:**

  - For each 64-byte block, compute the Keccak hash, resulting in a 32-byte output.
  - The prover sends the hash results to the SPJ.
  - Prover Sample(Golang):

  ```golang
  func calculateExpectedOutput(in []byte, N int) []byte {
      OutputSize := 16
      InputSize := 32
      expectedBytes := make([]byte, N*OutputSize)
      for i := 0; i < N; i++ {
          h := sha3.NewLegacyKeccak256()
          h.Write(in[i*InputSize : (i+1)*InputSize])
          copy(expectedBytes[i*OutputSize:(i+1)*OutputSize], h.Sum(nil))
      }
      return expectedBytes
  }
  ```

  ```golang
  expectedBytes := calculateExpectedOutput(in) // it calculates the hash of the input
  ipc.Write_byte_array(ProverToSPJPipe, expectedBytes)
  ```

  - Prover Sample(Rust):

  ```rust
  fn calculate_expected_output(input: &[u8], n: usize) -> Vec<u8> {
      let output_size = 16;
      let input_size = 32;
      let mut expected_bytes = vec![0u8; n * output_size];
      for i in 0..n {
          let mut hasher = Keccak256::new();
          hasher.update(&input[i * input_size..(i + 1) * input_size]);
          expected_bytes[i * output_size..(i + 1) * output_size].copy_from_slice(&hasher.finalize());
      }
      expected_bytes
  }
  ```

  ```rust
  let expected_bytes = calculate_expected_output(&input, n); // it calculates the hash of the input
  ipc::write_byte_array(&mut prover_to_spj_pipe, &expected_bytes).unwrap();
  ```

## How to submit your solution?

- You need to submit a binary prover file that matches our requirements.
- You need to submit the source code of your verifier code that matches our requirements. The code will be reviewed and published on the website.

## Hint

Use hex mode and remove all spaces to reproduce the sample input/output on https://emn178.github.io/online-tools/keccak_256.html

## Benchmark Details

We run the benchmark with N instances (represented as Instance Number in the table below) of the problem. The setup time, witness generation time, proof generation time are all averaged over N instances. We run verifier with single threaded execution, repeated multiple times and averaged over multiple runs.

- Setup time: the time before step 5 starts.
- Witness generation time: the time between end of step 5 and step 7.
- Proof generation time: the time between end of step 5 and step 8.
- Verification time: running time between end of step 8 and step 11.
- Peak memory: the peak memory usage of your program.
- Proof size: the byte length of the `YOUR PROOF BYTES` and `YOUR VERIFICATION KEY BYTES`. Your verifier will be audited, so please don't include any unnecessary data in the `YOUR PUBLIC INPUT BYTES`.
