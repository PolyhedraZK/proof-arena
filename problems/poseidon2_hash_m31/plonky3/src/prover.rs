use std::fs::File;
use std::io::Read;
use std::io::Write;

use p3_koala_bear::KoalaBear;
use p3_poseidon2_air::generate_trace_rows;

use plonky3_hash_m31::prove_poseidon;
use plonky3_hash_m31::setup;
use plonky3_hash_m31::HALF_FULL_ROUNDS;
use plonky3_hash_m31::NUM_HASHES;
use plonky3_hash_m31::PARTIAL_ROUNDS;
use plonky3_hash_m31::SBOX_DEGREE;
use plonky3_hash_m31::SBOX_REGISTERS;
use plonky3_hash_m31::WIDTH;
use rayon::current_num_threads;
use rayon::iter::IntoParallelRefIterator;
use rayon::iter::ParallelIterator;

fn main() -> std::io::Result<()> {
    // current number of threads, should be governed by the SPJ
    let num_threads = current_num_threads() as u64;

    // Initialize logging
    let mut log_file = File::create("/tmp/prover.log")?;
    log_file.write_all(format!("start with {} threads\n", num_threads).as_bytes())?;

    // Get pipe names from command-line arguments
    let args: Vec<String> = std::env::args().collect();
    let mut spj_to_prover_pipe = String::new();
    let mut prover_to_spj_pipe = String::new();

    for i in 1..args.len() {
        if args[i] == "-toMe" && i + 1 < args.len() {
            spj_to_prover_pipe.clone_from(&args[i + 1])
        } else if args[i] == "-toSPJ" && i + 1 < args.len() {
            prover_to_spj_pipe.clone_from(&args[i + 1])
        }
    }

    if spj_to_prover_pipe.is_empty() || prover_to_spj_pipe.is_empty() {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            "Pipe names not provided. Usage: prover ... -toMe <spj_to_prover_pipe> -toSPJ <prover_to_spj_pipe>",
        ));
    }

    // Log pipe names
    writeln!(log_file, "SPJ to Prover pipe: {}", spj_to_prover_pipe)?;
    writeln!(log_file, "Prover to SPJ pipe: {}", prover_to_spj_pipe)?;

    // Open pipes
    let mut spj_to_prover_pipe = std::io::BufReader::new(File::open(spj_to_prover_pipe)?);
    let mut prover_to_spj_pipe = File::create(prover_to_spj_pipe)?;

    log_file.write_all(b"pipes setup done \n")?;

    // Send prover info to SPJ
    write_string(&mut prover_to_spj_pipe, "Plonky3 Poseidon-m31 Prover")?;
    write_string(&mut prover_to_spj_pipe, "Plonk")?;
    write_string(&mut prover_to_spj_pipe, "Plony3")?;

    // Send N to SPJ (assuming MAX_NUM_HASHES is the N value)
    write_u64(&mut prover_to_spj_pipe, NUM_HASHES as u64 * num_threads)?;

    // Read witness from SPJ
    let buf = read_blob(&mut spj_to_prover_pipe)?;

    // Log witness information
    log_file.write_all(format!("buf_len: {:?}\n", buf.len()).as_bytes())?;
    log_file.write_all(format!("buf: {:?}\n", buf[..32].as_ref()).as_bytes())?;

    // Parse witness and compute digests
    let inputs = parse_prover_in(&buf, num_threads as usize);
    log_file.write_all(b"witness extracted from pipe\n")?;

    // Send digests back to SPJ
    write_byte_array(&mut prover_to_spj_pipe, "skip_digests".as_bytes())?;
    log_file.write_all(b"sending results back to spj\n")?;

    // Setup the parameters
    let (perm, config, air) = setup();

    // Generate the witnesses
    let traces = inputs
        .par_iter()
        .map(|input| {
            generate_trace_rows::<
                KoalaBear,
                WIDTH,
                SBOX_DEGREE,
                SBOX_REGISTERS,
                HALF_FULL_ROUNDS,
                PARTIAL_ROUNDS,
            >(input.clone()) // weird this API doesn't take a reference
        })
        .collect::<Vec<_>>();

    // Notify SPJ that witness is generated
    write_string(&mut prover_to_spj_pipe, "witness generated")?;
    log_file.write_all(b"sending `witness generated` to SPJ\n")?;

    // Generate proof
    let proof_bytes = traces
        .par_iter()
        .flat_map(|trace| {
            let proof = prove_poseidon(&perm, &config, &air, trace.clone());
            bincode::serialize(&proof).unwrap()
        })
        .collect::<Vec<_>>();
    // front pad the number of proofs
    let proof_bytes = [num_threads.to_le_bytes().to_vec(), proof_bytes].concat();

    // Send proof to SPJ
    log_file
        .write_all(format!("sending proof to SPJ, size: {}\n", proof_bytes.len()).as_bytes())?;
    log_file
        .write_all(format!("first 32 of proof: {:?}\n", proof_bytes[..32].as_ref()).as_bytes())?;
    write_byte_array(&mut prover_to_spj_pipe, &proof_bytes)?;

    // Send VK to SPJ
    let vk_bytes = vec![];
    log_file.write_all(format!("sending VK to SPJ, size: {}\n", vk_bytes.len()).as_bytes())?;
    write_byte_array(&mut prover_to_spj_pipe, &vk_bytes)?;

    // Send public witness to SPJ
    let pi = vec![];
    log_file
        .write_all(format!("sending public witnesses to SPJ, size: {}\n", pi.len()).as_bytes())?;
    write_byte_array(&mut prover_to_spj_pipe, &pi)?;
    log_file.write_all(b"finished\n")?;
    Ok(())
}

fn parse_prover_in(buf: &[u8], number_threads: usize) -> Vec<Vec<[KoalaBear; WIDTH]>> {
    let total_num = buf.len() / 4 / WIDTH;
    let num_per_thread = total_num / number_threads;

    let mut res = vec![];
    for i in 0..number_threads {
        let mut thread_res = vec![];
        for j in 0..num_per_thread {
            let thread_buf = &buf
                [(i * num_per_thread + j) * 4 * WIDTH..(i * num_per_thread + j + 1) * 4 * WIDTH];
            let mut thread_row = [KoalaBear::default(); WIDTH];
            for k in 0..WIDTH {
                let mut bytes = [0u8; 4];
                bytes.copy_from_slice(&thread_buf[k * 4..(k + 1) * 4]);
                thread_row[k] = KoalaBear::new(u32::from_le_bytes(bytes));
            }
            thread_res.push(thread_row);
        }
        res.push(thread_res);
    }
    res
}

// Helper functions for SPJ communication

/// Writes a string to the given writer
fn write_string<W: Write>(writer: &mut W, s: &str) -> std::io::Result<()> {
    let len = s.len() as u64;
    writer.write_all(&len.to_le_bytes())?;
    writer.write_all(s.as_bytes())?;
    writer.flush()?;
    Ok(())
}

/// Writes a u64 to the given writer
fn write_u64<W: Write>(writer: &mut W, n: u64) -> std::io::Result<()> {
    writer.write_all(&n.to_le_bytes())?;
    writer.flush()?;
    Ok(())
}

/// Writes a byte array to the given writer
fn write_byte_array<W: Write>(writer: &mut W, arr: &[u8]) -> std::io::Result<()> {
    let len = arr.len() as u64;
    writer.write_all(&len.to_le_bytes())?;
    writer.write_all(arr)?;
    writer.flush()?;
    Ok(())
}

/// Reads a blob of data from the given reader
fn read_blob<R: Read>(reader: &mut R) -> std::io::Result<Vec<u8>> {
    let mut len_buf = [0u8; 8];
    reader.read_exact(&mut len_buf)?;
    let len = u64::from_le_bytes(len_buf);

    let mut buf = vec![0u8; len as usize];
    reader.read_exact(&mut buf)?;
    Ok(buf)
}
