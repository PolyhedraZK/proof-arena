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

### Steps for the Prover Program:

1. **SPJ sends you the pipe filepath that handles the input output communication.**

   - Prover Sample:

   ```golang
   // open a named pipe to avoid blocking on stdin
   // read pipe name from stdin
   spjToProverPipeName := ipc.Read_string(os.Stdin)
   spjToProverPipe, err := os.OpenFile(spjToProverPipeName, os.O_RDONLY, os.ModeNamedPipe)
   if err != nil {
   	fmt.Fprintf(os.Stderr, "Error: %v\n", err)
   	os.Exit(1)
   }
   defer spjToProverPipe.Close()

   ProverToSPJPipeName := ipc.Read_string(os.Stdin)
   ProverToSPJPipe, err := os.OpenFile(ProverToSPJPipeName, os.O_WRONLY, os.ModeNamedPipe)
   if err != nil {
   	fmt.Fprintf(os.Stderr, "Error: %v\n", err)
   	os.Exit(1)
   }
   ```

2. **Output your prover name, proof system name, and algorithm name:**

   - Prover Sample:

   ```golang
   // send the prover name, algorithm name, and proof system name
   ipc.Write_string(ProverToSPJPipe, "Expander^2 Poseidon2 M31")
   ipc.Write_string(ProverToSPJPipe, "GKR")
   ipc.Write_string(ProverToSPJPipe, "Expander^2")
   ```


3. **Prover make all precomputes in this step**
You can do arbitary one-time precomputing (including setup/compile your circuit, prepare your proving key, etc.).

4. **Output the Number of Poseidon Instances:**

   - Print an 8-byte, little-endian long integer `N` to stdout. This indicates the number of Poseidon instances you are going to prove. Provers can choose `N` to optimize performance.
   - Prover Sample:

   ```golang
   ipc.Write_uint64(ProverToSPJPipe, uint64(N))
   ```

5. **Read Input Data:**

   - The SPJ will generate `64 * N` bytes and send them to the prover.
   - Prover Sample:

   ```golang
   inputBytes := ipc.Read_byte_array(spjToProverPipe)
   ```

6. **Hash the Data:**

   - For each 64-byte block, compute the Poseidon hash, resulting in a 32-byte output.
   - The prover sends the hash results to the SPJ.

7. **Output a String to Indicate Witness Generation Finished:**

   - Print the string `witness generated` to stdout to indicate that the witness generation is complete.
   - Prover Sample:

   ```golang
   ipc.Write_string(ProverToSPJPipe, "witness generated")
   ```

8. **Output the Proof:**

   - After you generated your proof, send the proof to the SPJ.
   - Prover Sample:

   ```golang
   func sendProofData(proof groth16.Proof, vk groth16.VerifyingKey, witness witness.Witness, outputPipe *os.File) error {
       writeBuffer := func(data interface {
           WriteTo(w io.Writer) (int64, error)
       }) error {
           buffer := bytes.NewBuffer(nil)
           if _, err := data.WriteTo(buffer); err != nil {
               return err
           }
           return ipc.Write_byte_array(outputPipe, buffer.Bytes())
       }

       if err := writeBuffer(proof); err != nil {
           return err
       }
       if err := writeBuffer(vk); err != nil {
           return err
       }

       publicWitness, err := witness.Public()
       if err != nil {
           return err
       }
       return writeBuffer(publicWitness)
   }
   ```

   ```golang
   proof, err := groth16.Prove(cs, pk, witness)
   if err != nil {
   	return err
   }

   return sendProofData(proof, vk, witness, outputPipe)
   ```

9. **SPJ starts your verifier by providing the pipe filepath that handles the input output communication.**

    - Verifier Sample:

    ```golang
    // open a named pipe to avoid blocking on stdin
    spjToVerifierPipeName := ipc.Read_string(os.Stdin)
    spjToVerifierPipe, err := os.OpenFile(spjToVerifierPipeName, os.O_RDONLY, os.ModeNamedPipe)
    if err != nil {
        fmt.Fprintf(os.Stderr, "Error: %v\n", err)
        os.Exit(1)
    }

    VerifierToSPJPipeName := ipc.Read_string(os.Stdin)
    VerifierToSPJPipe, err := os.OpenFile(VerifierToSPJPipeName, os.O_WRONLY, os.ModeNamedPipe)
    if err != nil {
        fmt.Fprintf(os.Stderr, "Error: %v\n", err)
        os.Exit(1)
    }
    ```

10. **SPJ sends the proof, verification key, and public input to the verifier.**
    - Verifier Sample:

      ```golang
      proofBytes := ipc.Read_byte_array(inputPipe)
      vkBytes := ipc.Read_byte_array(inputPipe)
      publicWitnessBytes := ipc.Read_byte_array(inputPipe)
      ```

11. **Verify the Proof, and send back result**
    In the verifier's response, you should output the verification result. And because verifier usually runs fast, we require you to repeatively run your verifier multiple times, so you need to additionally output a 64-bit unsigned integer to show your number of repeats.

    - Verifier Sample:

    ```golang
    numRepeats := 10000
    for i := 0; i < numRepeats; i++ {
        err = groth16.Verify(proof, vk, publicWitness)
    }
    if err != nil {
        fmt.Fprintf(os.Stderr, "Error: %v\n", err)
        ipc.Write_byte_array(outputPipe, []byte{0})
        repeatByte := make([]byte, 8)
        binary.LittleEndian.PutUint64(repeatByte, uint64(numRepeats))
        ipc.Write_byte_array(outputPipe, repeatByte)
    } else {
        fmt.Fprintf(os.Stderr, "Proof verified\n")
        ipc.Write_byte_array(outputPipe, []byte{0xff})
        repeatByte := make([]byte, 8)
        binary.LittleEndian.PutUint64(repeatByte, uint64(numRepeats))
        ipc.Write_byte_array(outputPipe, repeatByte)
    }
    fmt.Fprintf(os.Stderr, "Done\n")
    return nil
    ```

## How to submit your solution?

- You need to submit a binary prover file that matches our requirements.
- You need to submit the source code of your verifier code that matches our requirements. The code will be reviewed and published on the website.

## Benchmark Details

- Setup time: the time before step 4 finish.
- Witness generation time: the time between end of step 5 and step 7.
- Proof generation time: the time between end of step 5 and step 8.
- Verification time: running time between end of step 8 and step 11.
- Peak memory: the peak memory usage of your program.
- Proof size: the byte length of the `YOUR PROOF BYTES` and `YOUR VERIFICATION KEY BYTES`. Your verifier will be audited, so please don't include any unnecessary data in the `YOUR PUBLIC INPUT BYTES`.
