## Inter-process Communication (Prover, Verifier <-> SPJ)

We use [named pipes](https://en.wikipedia.org/wiki/Named_pipe) for inter-process communication between the prover, verifier, and the Special Judge (SPJ).

In Rust, we utilize `std::fs::File` along with `std::io::{Read, Write}` to interact with named pipes.

## Data Transmission Format

To transmit a byte array `Vec<u8>`, we use the following encoding:

1. **Encode the Length of the Array in Little-endian Format**:

   ```rust
   let length_bytes = (data.len() as u64).to_le_bytes();
   ```

2. **Concatenate `length_bytes` with `data`**:

   ```rust
   let mut encoded = length_bytes.to_vec();
   encoded.extend_from_slice(&data);
   ```

**Sending Data**: Write the `encoded` data to the pipe.

**Receiving Data**: Read data from the pipe by:

1. **Reading the First 8 Bytes as Length Bytes**:

   ```rust
   let mut length_bytes = [0u8; 8];
   reader.read_exact(&mut length_bytes)?;
   let length = u64::from_le_bytes(length_bytes);
   ```

2. **Reading the Remaining `length` Bytes**:

   ```rust
   let mut buffer = vec![0u8; length as usize];
   reader.read_exact(&mut buffer)?;
   ```

## Sample SPJ Usage

In the `problems/keccak256_hash/halo2` directory, we provide a Rust implementation demonstrating the interaction with the SPJ. The key interaction logic is located in `src/prover.rs` and `src/verifier.rs`.

### Prover Implementation

**File**: `src/prover.rs`

1. **Parsing Command-line Arguments**:

   The prover expects the SPJ to provide the names of the pipes for communication.

   ```rust
   // Parse command-line arguments to get pipe names
   let args: Vec<String> = std::env::args().collect();
   let mut spj_to_prover_pipe = String::new();
   let mut prover_to_spj_pipe = String::new();

   for i in 1..args.len() {
       if args[i] == "-toMe" && i + 1 < args.len() {
           spj_to_prover_pipe = args[i + 1].clone();
       } else if args[i] == "-toSPJ" && i + 1 < args.len() {
           prover_to_spj_pipe = args[i + 1].clone();
       }
   }
   ```

2. **Opening Named Pipes**:

   ```rust
   // Open pipes
   let mut spj_to_prover_pipe = std::io::BufReader::new(File::open(spj_to_prover_pipe)?);
   let mut prover_to_spj_pipe = File::create(prover_to_spj_pipe)?;
   ```

3. **Sending Prover Information to SPJ**:

   ```rust
   // Send prover info to SPJ
   write_string(&mut prover_to_spj_pipe, "Halo2 Keccak Prover")?;
   write_string(&mut prover_to_spj_pipe, "Plonk")?;
   write_string(&mut prover_to_spj_pipe, "Halo2")?;
   ```

4. **Sending `N` to SPJ**:

   ```rust
   // Send N to SPJ
   write_u64(&mut prover_to_spj_pipe, MAX_NUM_HASHES as u64)?;
   ```

5. **Receiving Input from SPJ**:

   ```rust
   // Read input data from SPJ
   let buf = read_blob(&mut spj_to_prover_pipe)?;
   ```

6. **Processing Data and Sending Results Back to SPJ**:

   ```rust
   // Process data and compute digests
   let (witness, digests) = parse_prover_in(&buf)?;

   // Send digests back to SPJ
   write_byte_array(
       &mut prover_to_spj_pipe,
       &digests.iter().flat_map(|x| x.as_slice()).cloned().collect::<Vec<u8>>(),
   )?;
   ```

7. **Indicating Witness Generation Completion**:

   ```rust
   // Notify SPJ that witness generation is complete
   write_string(&mut prover_to_spj_pipe, "witness generated")?;
   ```

8. **Sending Proof, Verification Key, and Public Inputs to SPJ**:

   ```rust
   // Send proof to SPJ
   write_byte_array(&mut prover_to_spj_pipe, &proof)?;
   // Send verification key to SPJ
   write_byte_array(&mut prover_to_spj_pipe, &vk)?;
   // Send public inputs to SPJ
   write_byte_array(&mut prover_to_spj_pipe, &public_inputs)?;
   ```

### Verifier Implementation

**File**: `src/verifier.rs`

1. **Parsing Command-line Arguments**:

   ```rust
   // Parse command-line arguments to get pipe names
   let args: Vec<String> = std::env::args().collect();
   let mut spj_to_verifier_pipe = String::new();
   let mut verifier_to_spj_pipe = String::new();

   for i in 1..args.len() {
       if args[i] == "-toMe" && i + 1 < args.len() {
           spj_to_verifier_pipe = args[i + 1].clone();
       } else if args[i] == "-toSPJ" && i + 1 < args.len() {
           verifier_to_spj_pipe = args[i + 1].clone();
       }
   }
   ```

2. **Opening Named Pipes**:

   ```rust
   // Open pipes
   let mut spj_to_verifier_pipe = std::io::BufReader::new(File::open(spj_to_verifier_pipe)?);
   let mut verifier_to_spj_pipe = File::create(verifier_to_spj_pipe)?;
   ```

3. **Receiving Proof Data from SPJ**:

   ```rust
   // Read proof, verification key, and public inputs from SPJ
   let proof_bytes = read_blob(&mut spj_to_verifier_pipe)?;
   let vk_bytes = read_blob(&mut spj_to_verifier_pipe)?;
   let public_inputs_bytes = read_blob(&mut spj_to_verifier_pipe)?;
   ```

4. **Verifying the Proof**:

   ```rust
   // Number of repetitions for verification
   let repeat = 1000u64;

   // Perform verification multiple times
   let verification_successful = (0..repeat)
       .all(|_| verify_snark::<KeccakCircuit>(&srs, &snark, &vk));
   ```

5. **Sending Verification Result to SPJ**:

   ```rust
   // Send verification result to SPJ
   let result_byte = if verification_successful { 255u8 } else { 0u8 };
   write_byte_array(&mut verifier_to_spj_pipe, &[result_byte])?;
   // Send the number of repetitions
   write_byte_array(&mut verifier_to_spj_pipe, &repeat.to_le_bytes())?;
   ```

## Helper Functions for SPJ Communication

```rust
/// Reads a blob of data from the given reader
fn read_blob<R: Read>(reader: &mut R) -> std::io::Result<Vec<u8>> {
    let mut len_buf = [0u8; 8];
    reader.read_exact(&mut len_buf)?;
    let len = u64::from_le_bytes(len_buf);

    let mut buf = vec![0u8; len as usize];
    reader.read_exact(&mut buf)?;
    Ok(buf)
}

/// Writes a byte array to the given writer
fn write_byte_array<W: Write>(writer: &mut W, arr: &[u8]) -> std::io::Result<()> {
    let len = arr.len() as u64;
    writer.write_all(&len.to_le_bytes())?;
    writer.write_all(arr)?;
    writer.flush()?;
    Ok(())
}
```
