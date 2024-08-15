---
problem_id: 1
title: Keccak256 Hash
description: Keccak256 hash
draft: false
enable_comments: true
proposer: Polyhedra Network
proposer_icon: assets/icons/xxx.png (24x24)
---

## Problem Description

Your prover program must read bytes from stdin and print bytes to stdout. We will use a special judge program (SPJ) to interact with your prover by providing inputs and checking outputs. The SPJ communicates with the prover through the prover's stdin and stdout. Additionally, the SPJ will invoke your verifier to check your proof.

### Steps for the Prover Program:

1. **SPJ sends you the pipe filepath that handles the input output communication.**

   - Prover Sample:

   ```golang
       ---
   aa: aa
   bb:bb
   ---

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
   ipc.Write_string(ProverToSPJPipe, "GNARK KECCAK-256")
   ipc.Write_string(ProverToSPJPipe, "Groth16")
   ipc.Write_string(ProverToSPJPipe, "GNARK")
   ```

3. **Read the serialized circuit bytes from the SPJ:**

   - The SPJ will send the serialized circuit bytes to the prover.
   - Prover Sample:

   ```golang
   // this single file contains the r1cs, pk, and vk
   combinedBytes := ipc.Read_byte_array(spjToProverPipe)
   // split the bytes into r1cs, pk, and vk
   byteReader := bytes.NewReader(combinedBytes)
   r1csBytes := ipc.Read_byte_array(byteReader)
   pkBytes := ipc.Read_byte_array(byteReader)
   vkBytes := ipc.Read_byte_array(byteReader)
   ```

4. **Output the Number of SHA256 Instances:**

   - Print an 8-byte, little-endian long integer `N` to stdout. This indicates the number of SHA256 instances you are going to prove. Provers can choose `N` to optimize performance.
   - Prover Sample:

   ```golang
   ipc.Write_uint64(ProverToSPJPipe, uint64(N))
   ```

5. **Output a String to Indicate Setup Finished:**

   - Print the string `setup finished` to stdout to indicate that the setup is complete.
   - Prover Sample:

   ```golang
   ipc.Write_string(ProverToSPJPipe, "setup finished")
   ```

6. **Read Input Data:**

   - The SPJ will generate `64 * N` bytes and send them to the prover.
   - Prover Sample:

   ```golang
   inputBytes := ipc.Read_byte_array(spjToProverPipe)
   ```

7. **Hash the Data:**

   - For each 64-byte block, compute the SHA256 hash, resulting in a 32-byte output.
   - The prover sends the hash results to the SPJ.
   - Prover Sample:

   ```golang
   func calculateExpectedOutput(in []byte) []byte {
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

8. **Output a String to Indicate Witness Generation Finished:**

   - Print the string `witness generated` to stdout to indicate that the witness generation is complete.
   - Prover Sample:

   ```golang
   ipc.Write_string(ProverToSPJPipe, "witness generated")
   ```

9. **Output the Proof:**

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

10. **SPJ starts your verifier by providing the pipe filepath that handles the input output communication.**

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

11. **SPJ sends the proof, verification key, and public input to the verifier.**
    - Verifier Sample:
      ```golang
      proofBytes := ipc.Read_byte_array(inputPipe)
      vkBytes := ipc.Read_byte_array(inputPipe)
      publicWitnessBytes := ipc.Read_byte_array(inputPipe)
      ```
12. **Verify the Proof, and send back result**
    - Verifier Sample:
    ```golang
    err = groth16.Verify(proof, vk, publicWitness)
    if err != nil {
        fmt.Fprintf(os.Stderr, "Error: %v\n", err)
        ipc.Write_byte_array(outputPipe, []byte{0}) // 0 means proof is invalid
    } else {
        fmt.Fprintf(os.Stderr, "Proof verified\n")
        ipc.Write_byte_array(outputPipe, []byte{0xff}) // 0xff means proof is valid
    }
    fmt.Fprintf(os.Stderr, "Done\n")
    return nil
    ```

## How to submit your solution?

- You need to submit a binary prover file that matches our requirements.
- You need to submit a circuit file. (This is not required for all provers, for example Halo2 doesn't have a circuit, so you can submit an empty file.)
- You need to submit the source code of your verifier code that matches our requirements. The code will be reviewed and published on the website.

## Hint

Use hex mode and remove all spaces to reproduce the sample input/output on https://emn178.github.io/online-tools/keccak_256.html

## Benchmark Details

- Setup time: the time before step 5 finish.
- Witness generation time: the time between end of step 6 and step 8.
- Proof generation time: the time between end of step 6 and step 9.
- Verification time: running time between end of step 9 and step 12.
- Peak memory: the peak memory usage of your program.
- Proof size: the byte length of the `YOUR PROOF BYTES` and `YOUR VERIFICATION KEY BYTES`. Your verifier will be audited, so please don't include any unnecessary data in the `YOUR PUBLIC INPUT BYTES`.
