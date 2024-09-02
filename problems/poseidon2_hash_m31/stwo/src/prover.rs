use std::fs::File;
use std::io::Read;
use std::io::Write;

use stwo_poseidon::prove_poseidon;
use stwo_poseidon::setup;
use stwo_poseidon::N_LOG_INSTANCES;
use stwo_poseidon::N_STATE;

fn main() -> std::io::Result<()> {
    // Initialize logging
    let mut log_file = File::create("/tmp/prover.log")?;
    log_file.write_all(b"start \n")?;

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
    write_string(&mut prover_to_spj_pipe, "STWO Poseidon-m31 Prover")?;
    write_string(&mut prover_to_spj_pipe, "STARK")?;
    write_string(&mut prover_to_spj_pipe, "STWO")?;

    // Send N to SPJ (assuming MAX_NUM_HASHES is the N value)
    write_u64(&mut prover_to_spj_pipe, 1 << N_LOG_INSTANCES as u64)?;

    // Read witness from SPJ
    let buf = read_blob(&mut spj_to_prover_pipe)?;

    // Log witness information
    log_file.write_all(format!("buf_len: {:?}\n", buf.len()).as_bytes())?;
    log_file.write_all(format!("buf: {:?}\n", buf[..32].as_ref()).as_bytes())?;

    // Parse witness and compute digests
    let instance_bytes = parse_prover_in(&buf);
    log_file.write_all(b"witness extracted from pipe\n")?;

    // Send digests back to SPJ
    write_byte_array(&mut prover_to_spj_pipe, "skip_digests".as_bytes())?;
    log_file.write_all(b"sending results back to spj\n")?;

    // Setup the parameters
    let (pcs_config, twiddles) = setup(N_LOG_INSTANCES as u32);

    // Generate the witnesses
    // do nothing

    // Notify SPJ that witness is generated
    write_string(&mut prover_to_spj_pipe, "witness generated")?;
    log_file.write_all(b"sending `witness generated` to SPJ\n")?;

    // Generate proof
    let proof_bytes = prove_poseidon(&pcs_config, &twiddles, instance_bytes);

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

fn parse_prover_in(buf: &[u8]) -> Vec<[u32; N_STATE]> {
    buf.chunks(N_STATE)
        .map(|chunk| {
            let mut tmp = [0u32; N_STATE];

            chunk
                .chunks(4)
                .enumerate()
                .for_each(|(i, buf)| tmp[i] = u32::from_le_bytes([buf[0], buf[1], buf[2], buf[3]]));

            tmp
        })
        .collect()
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
