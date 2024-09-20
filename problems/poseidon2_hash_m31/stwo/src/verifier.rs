use std::{
    fs::File,
    io::{Read, Write},
};

use ark_std::{end_timer, start_timer};
use stwo_poseidon::{setup, verify_poseidon, WrappedProof, N_LOG_INSTANCES};

fn main() -> std::io::Result<()> {
    // Initialize logging
    let mut log_file = File::create("/tmp/verifier.log")?;

    log_file.write_all(b"start\n")?;

    // Get pipe names from command-line arguments
    let args: Vec<String> = std::env::args().collect();
    let mut spj_to_verifier_pipe = String::new();
    let mut verifier_to_spj_pipe = String::new();

    for i in 1..args.len() {
        if args[i] == "-toMe" && i + 1 < args.len() {
            spj_to_verifier_pipe.clone_from(&args[i + 1]);
        } else if args[i] == "-toSPJ" && i + 1 < args.len() {
            verifier_to_spj_pipe.clone_from(&args[i + 1]);
        }
    }

    if spj_to_verifier_pipe.is_empty() || verifier_to_spj_pipe.is_empty() {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            "Pipe names not provided. Usage: verifier ... -toMe <spj_to_verifier_pipe> -toSPJ <verifier_to_spj_pipe>",
        ));
    }

    // Log pipe names
    log_file.write_all(format!("SPJ to Verifier pipe: {}\n", spj_to_verifier_pipe).as_bytes())?;
    log_file.write_all(format!("Verifier to SPJ pipe: {}\n", verifier_to_spj_pipe).as_bytes())?;

    // Open pipes
    let mut spj_to_verifier_pipe = std::io::BufReader::new(File::open(spj_to_verifier_pipe)?);
    let mut verifier_to_spj_pipe = File::create(verifier_to_spj_pipe)?;

    log_file.write_all(b"setups done\n")?;

    // Set number of verification repetitions
    let repeat = 100u64;

    // Read proof, vk, and witnesses from SPJ
    let proof_bytes = read_blob(&mut spj_to_verifier_pipe)?;
    log_file
        .write_all(format!("proof extracted from pipe, size {}\n", proof_bytes.len()).as_bytes())?;
    let proofs = bincode::deserialize::<Vec<WrappedProof>>(&proof_bytes).unwrap();
    log_file
        .write_all(format!("proof deserialized, {} proofs in total\n", proofs.len()).as_bytes())?;
    let proof_bytes = proofs
        .iter()
        .map(|p| bincode::serialize(p).unwrap())
        .collect::<Vec<_>>();

    let vk_bytes = read_blob(&mut spj_to_verifier_pipe)?;
    log_file.write_all(format!("vk extracted from pipe, size {}\n", vk_bytes.len()).as_bytes())?;

    let witnesses = read_blob(&mut spj_to_verifier_pipe)?;
    log_file.write_all(
        format!("witnesses extracted from pipe, size {}\n", witnesses.len()).as_bytes(),
    )?;

    // Setup the parameters
    let (pcs_config, _twiddles) = setup(N_LOG_INSTANCES as u32);
    log_file.write_all(b"finished setup\n")?;

    // Verify SNARK
    let res = (0..repeat).all(|_| {
        let timer = start_timer!(|| "verification time");
        let res = proof_bytes
            .iter()
            .all(|proof| verify_poseidon(&pcs_config, proof));
        end_timer!(timer);
        res
    });
    log_file.write_all(format!("verification: {} \n", res).as_bytes())?;

    // Send verification result to SPJ
    let res = match res {
        true => 255u8,
        false => 0,
    };
    write_byte_array(&mut verifier_to_spj_pipe, &[res])?;
    write_byte_array(&mut verifier_to_spj_pipe, repeat.to_le_bytes().as_ref())?;
    log_file.write_all(format!("write to SPJ: repeating {} times\n", repeat).as_bytes())?;
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

/// Writes a byte array to the given writer
fn write_byte_array<W: Write>(writer: &mut W, arr: &[u8]) -> std::io::Result<()> {
    let len = arr.len() as u64;
    writer.write_all(&len.to_le_bytes())?;
    writer.write_all(arr)?;
    writer.flush()?;
    Ok(())
}
