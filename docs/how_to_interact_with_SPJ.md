# How to Interact with SPJ (Go Version)

## Inter-process Communication (Prover, Verifier <-> SPJ)

We use [named pipes](https://en.wikipedia.org/wiki/Named_pipe) for inter-process communication between the prover, verifier, and the Special Judge (SPJ).

In Go, we utilize the `os` and `io` packages to open and interact with named pipes.

## Data Transmission Format

To transmit a byte slice `[]byte`, we use the following encoding:

1. **Encode the Length of the Array in Little-endian Format**:

   ```go
   lengthBytes := make([]byte, 8)
   binary.LittleEndian.PutUint64(lengthBytes, uint64(len(data)))
   ```

2. **Concatenate `lengthBytes` with `data`**:

   ```go
   encoded := append(lengthBytes, data...)
   ```

**Sending Data**: Write the `encoded` data to the pipe.

**Receiving Data**: Read data from the pipe by:

1. **Reading the First 8 Bytes as Length Bytes**:

   ```go
   lengthBytes := make([]byte, 8)
   _, err := io.ReadFull(reader, lengthBytes)
   if err != nil {
       // Handle error
   }
   length := binary.LittleEndian.Uint64(lengthBytes)
   ```

2. **Reading the Remaining `length` Bytes**:

   ```go
   data := make([]byte, length)
   _, err = io.ReadFull(reader, data)
   if err != nil {
       // Handle error
   }
   ```

## Prover Implementation

**File**: `main.go`

1. **Parsing Command-line Arguments**:

   The prover expects the SPJ to provide the names of the pipes for communication.

   ```go
   toProver := flag.String("toMe", "", "Pipe from SPJ to Prover")
   toSPJ := flag.String("toSPJ", "", "Pipe from Prover to SPJ")
   flag.Parse()

   spjToProverPipeName := *toProver
   proverToSPJPipeName := *toSPJ
   ```

2. **Opening Named Pipes**:

   ```go
   spjToProverPipe, err := os.OpenFile(spjToProverPipeName, os.O_RDONLY, os.ModeNamedPipe)
   if err != nil {
       fmt.Fprintf(os.Stderr, "Error opening SPJ to Prover pipe: %v\n", err)
       os.Exit(1)
   }
   defer spjToProverPipe.Close()

   proverToSPJPipe, err := os.OpenFile(proverToSPJPipeName, os.O_WRONLY, os.ModeNamedPipe)
   if err != nil {
       fmt.Fprintf(os.Stderr, "Error opening Prover to SPJ pipe: %v\n", err)
       os.Exit(1)
   }
   defer proverToSPJPipe.Close()
   ```

3. **Sending Prover Information to SPJ**:

   ```go
   ipc.WriteString(proverToSPJPipe, "GNARK KECCAK-256") // Prover Name
   ipc.WriteString(proverToSPJPipe, "Groth16")          // Proof System
   ipc.WriteString(proverToSPJPipe, "GNARK")            // Algorithm
   ```

4. **Sending `N` to SPJ**:

   Assuming `N` is the number of hashes to process.

   ```go
   ipc.WriteUInt64(proverToSPJPipe, uint64(N))
   ```

5. **Receiving Input from SPJ**:

   ```go
   inputData := ipc.ReadByteArray(spjToProverPipe)
   ```

6. **Processing Data and Sending Results Back to SPJ**:

   Compute the expected outputs (e.g., Keccak-256 hashes) and send them back.

   ```go
   expectedBytes := calculateExpectedOutput(inputData, N)
   ipc.WriteByteArray(proverToSPJPipe, expectedBytes)
   ```

7. **Indicating Witness Generation Completion**:

   ```go
   ipc.WriteString(proverToSPJPipe, "witness generated")
   ```

8. **Sending Proof, Verification Key, and Public Inputs to SPJ**:

   ```go
   ipc.WriteByteArray(proverToSPJPipe, proofBytes)
   ipc.WriteByteArray(proverToSPJPipe, vkBytes)
   ipc.WriteByteArray(proverToSPJPipe, publicInputs)
   ```

## Verifier Implementation

**File**: `verifier.go`

1. **Parsing Command-line Arguments**:

   ```go
   toVerifier := flag.String("toMe", "", "Pipe from SPJ to Verifier")
   toSPJ := flag.String("toSPJ", "", "Pipe from Verifier to SPJ")
   flag.Parse()

   spjToVerifierPipeName := *toVerifier
   verifierToSPJPipeName := *toSPJ
   ```

2. **Opening Named Pipes**:

   ```go
   spjToVerifierPipe, err := os.OpenFile(spjToVerifierPipeName, os.O_RDONLY, os.ModeNamedPipe)
   if err != nil {
       fmt.Fprintf(os.Stderr, "Error opening SPJ to Verifier pipe: %v\n", err)
       os.Exit(1)
   }
   defer spjToVerifierPipe.Close()

   verifierToSPJPipe, err := os.OpenFile(verifierToSPJPipeName, os.O_WRONLY, os.ModeNamedPipe)
   if err != nil {
       fmt.Fprintf(os.Stderr, "Error opening Verifier to SPJ pipe: %v\n", err)
       os.Exit(1)
   }
   defer verifierToSPJPipe.Close()
   ```

3. **Receiving Proof Data from SPJ**:

   ```go
   proofBytes := ipc.ReadByteArray(spjToVerifierPipe)
   vkBytes := ipc.ReadByteArray(spjToVerifierPipe)
   publicInputs := ipc.ReadByteArray(spjToVerifierPipe)
   ```

4. **Verifying the Proof**:

   ```go
   isValid, err := VerifyProof(proofBytes, vkBytes, publicInputs)
   if err != nil {
       fmt.Fprintf(os.Stderr, "Error during proof verification: %v\n", err)
       os.Exit(1)
   }
   ```

5. **Sending Verification Result to SPJ**:

   ```go
   var resultByte byte
   if isValid {
       resultByte = 0xFF // 0xFF indicates success
   } else {
       resultByte = 0x00 // 0x00 indicates failure
   }
   ipc.WriteByteArray(verifierToSPJPipe, []byte{resultByte})
   ```

## Helper Functions for SPJ Communication

You can find the helper function for SPJ in [ipc.go](https://github.com/PolyhedraZK/proof-arena/blob/main/SPJ/IPCUtils/ipc.go), use it by import

```go
import (
    ipc "github.com/PolyhedraZK/proof-arena/SPJ/IPCUtils"
)
```
