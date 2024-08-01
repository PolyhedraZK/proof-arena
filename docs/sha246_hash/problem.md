---
problem_id: 2
title: SHA256 Hash 
description: SHA256 hash
draft: false
enable_comments: true
proposer: Polyhedra Network
proposer_icon: assets/icons/xxx.png (24x24)
---

## Problem Description

Your prover program must read bytes from stdin and print bytes to stdout. We will use a special judge program (SPJ) to interact with your prover by providing inputs and checking outputs. The SPJ communicates with the prover through the prover's stdin and stdout. Additionally, the SPJ will invoke your verifier to check your proof.

### Steps for the Prover Program:

1. **Output the Number of SHA256 Instances:**
   - Print an 8-byte, little-endian long integer `N` to stdout. This indicates the number of SHA256 instances you are going to prove. Provers can choose `N` to optimize performance.

2. **Read Input Data:**
   - The SPJ will generate `64 * N` bytes and send them to the prover's stdin.
   - The prover needs to read these `64 * N` bytes from stdin.

3. **Hash the Data:**
   - For each 64-byte block, compute the SHA256 hash, resulting in a 32-byte output.
   - The prover needs to output `32 * N` bytes as the hash result.

4. **Output the Proof:**
   - After producing the `32 * N` bytes of hash results, print your proof bytes to stdout for the SPJ to read and verify.

This process ensures that the prover correctly processes the input data and provides a valid proof as required by the SPJ.

## How to submit your solution?
- You need to submit a binary prover file that matches our requirements.
- You need to submit a circuit file. (This is not required for all provers, for example Halo2 doesn't have a circuit, so you can submit an empty file.)
- You need to submit the source code of your verifier code that matches our requirements. The code will be reviewed and published on the website.

## Sample Interaction (denoted as hex, separated by 8 bytes)

1. **SPJ starts your prover program.**

2. **Prover sends `N` to SPJ's stdout:**

   ```
   0400000000000000
   ```
   (little endian hex of number 4)

3. **SPJ reads your serialized circuit from your provided `circuit` file.**

4. **SPJ sends to prover's stdin:**

   ```
   SERIALIZED_CIRCUIT_BYTES
   ```


5. **Prover sends to SPJ's stdout:**

   ```
   73657475702066696e6973686564
   ```

   (This represents the string "setup finished" in bytes, which helps the SPJ determine your setup time. For provers with no setup, print this immediately, and the SPJ will set your setup time to `0`.)

6. **SPJ sends to prover's stdin:**

   ```
   0000000000000000 0000000000000000 0000000000000000 0000000000000000
   0000000000000000 0000000000000000 0000000000000000 0000000000000000

   0000000000000000 0000000000000000 0000000000000000 0000000000000000
   0000000000000000 0000000000000000 0000000000000000 0000000000000001

   0000000000000000 0000000000000000 0000000000000000 0000000000000000
   0000000000000000 0000000000000000 0000000000000000 0000000000000002

   0000000000000000 0000000000000000 0000000000000000 0000000000000000
   0000000000000000 0000000000000000 0000000000000000 0000000000000003
   ```

7. **Prover sends to SPJ's stdout:**

   ```
   f5a5fd42d16a2030 2798ef6ed309979b 43003d2320d9f0e8 ea9831a92759fb4b
   90f4b39548df55ad 6187a1d20d731ece e78c545b94afd16f 42ef7592d99cd365
   bdc9bd36ac7f2583 51c81a3155a19ea5 837b6ef164074f01 89d876a5ec17f920
   ed1e338910836644 d88868b3f7326fad 9262abff7bc13dd4 d1d7eb51cc42f29a
   ```

8. **Prover sends to SPJ's stdout:**

   ```
   7769746e6573732067656e657261746564
   ```

   (This represents the string "witness generated" in bytes, which helps the SPJ determine your program's witness generation time.)

9. **Prover sends to SPJ's stdout:**

   ```
   YOUR PROOF BYTES
   ```
10. **Prover program quit**

11. **SPJ invokes your verifier and send `YOUR PROOF BYTES` to verifier's stdin, verifier should output a byte to stdout, byte `00` represent false, byte `ff` represents true, after verifier outputs the byte, the verifier should terminate.**

## Hint
Use hex mode and remove all spaces to reproduce the sample input/output on https://emn178.github.io/online-tools/sha256.html

## Benchmark Details
- Setup time: the time before step 5 finish.
- Witness generation time: the time between end of step 6 and step 8.
- Proof generation time: the time between end of step 6 and step 10.
- Verification time: running time of step 11.
- Peak memory: the peak memory usage of your program.
- Proof size: the byte length of the proof.