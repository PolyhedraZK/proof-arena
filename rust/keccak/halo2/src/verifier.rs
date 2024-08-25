use std::{
    fs::File,
    io::{Read, Write},
};

use ark_std::{end_timer, start_timer};
use halo2_proofs::{
    plonk::VerifyingKey,
    poly::{commitment::Params, kzg::commitment::ParamsKZG},
    SerdeFormat,
};
use halo2curves::bn256::{Bn256, G1Affine};
use halo2_keccak_circuit::circuit::KeccakCircuit;
use snark_verifier_sdk::{verify_snark_gwc, Snark};

fn main() -> std::io::Result<()> {
    let mut log_file = File::create("verifier.log")?;
    let srs_file_path = "srs_bn256.data";
    let vk_file_path = "keccak_vk.data";
    let snark_file_path = "keccak_snark.data";

    log_file.write_all(b"start\n")?;

    // Get pipe names from command-line arguments
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 3 {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            "Not enough arguments. Usage: verifier <spj_to_verifier_pipe> <verifier_to_spj_pipe>",
        ));
    }

    let spj_to_verifier_pipe = &args[1];
    let verifier_to_spj_pipe = &args[2];

    log_file.write_all(format!("SPJ to Verifier pipe: {}\n", spj_to_verifier_pipe).as_bytes())?;
    log_file.write_all(format!("Verifier to SPJ pipe: {}\n", verifier_to_spj_pipe).as_bytes())?;

    let mut spj_to_verifier_pipe = std::io::BufReader::new(File::open(spj_to_verifier_pipe)?);
    let mut verifier_to_spj_pipe = File::create(verifier_to_spj_pipe)?;

    log_file.write_all(b"setups done\n")?;

    // repeating verification for 10k times so that the armotized SRS time becomes negligible
    let repeat = 1000u64;

    let proof_bytes = read_blob(&mut spj_to_verifier_pipe)?;
    log_file
        .write_all(format!("proof extracted from pipe, size {}\n", proof_bytes.len()).as_bytes())?;

    let vk_bytes = read_blob(&mut spj_to_verifier_pipe)?;
    log_file.write_all(format!("vk extracted from pipe, size {}\n", vk_bytes.len()).as_bytes())?;

    let witnesses = read_blob(&mut spj_to_verifier_pipe)?;
    log_file.write_all(
        format!("witnesses extracted from pipe, size {}\n", witnesses.len()).as_bytes(),
    )?;

    // SRS
    let srs = {
        let timer = start_timer!(|| "read srs");
        let mut srs_file = std::fs::File::open(srs_file_path)?;
        let srs = ParamsKZG::<Bn256>::read(&mut srs_file)?;
        end_timer!(timer);
        log_file.write_all(b"srs loaded from disk\n")?;
        srs
    };

    // vk
    let vk = {
        let timer = start_timer!(|| "read verification key");
        let mut vk_file = std::fs::File::open(vk_file_path)?;
        let vk = VerifyingKey::<G1Affine>::read::<_, KeccakCircuit>(
            &mut vk_file,
            SerdeFormat::RawBytesUnchecked,
        )?;
        end_timer!(timer);
        log_file.write_all(b"vk loaded from disk \n")?;
        vk
    };

    // snark
    // this is a hack to use the verify_snark_gwc without sending the whole snark, just the proof
    let snark = {
        let timer = start_timer!(|| "read snark");
        let snark_file = std::fs::File::open(snark_file_path)?;
        let mut snark: Snark = serde_json::from_reader(snark_file)?;
        end_timer!(timer);
        snark.proof = proof_bytes;
        log_file.write_all("snark constructed\n".as_bytes())?;
        snark
    };

    let res = (0..repeat)
        .map(|_| {
            let timer = start_timer!(|| "verification time");
            let res = verify_snark_gwc::<KeccakCircuit>(&srs, snark.clone(), &vk);
            // let res = true;
            end_timer!(timer);
            res
        })
        .all(|x| x);
    log_file.write_all(format!("verification: {} \n", res).as_bytes())?;

    let res = match res {
        true => 255u8,
        false => 0,
    };
    write_byte_array(&mut verifier_to_spj_pipe, &[res])?;
    write_byte_array(&mut verifier_to_spj_pipe, repeat.to_le_bytes().as_ref())?;
    log_file.write_all(format!("write to SPJ: repeating {} times\n", repeat).as_bytes())?;
    Ok(())
}

fn read_blob<R: Read>(reader: &mut R) -> std::io::Result<Vec<u8>> {
    let mut len_buf = [0u8; 8];
    reader.read_exact(&mut len_buf)?;
    let len = u64::from_le_bytes(len_buf);

    let mut buf = vec![0u8; len as usize];
    reader.read_exact(&mut buf)?;
    Ok(buf)
}

fn write_byte_array<W: Write>(writer: &mut W, arr: &[u8]) -> std::io::Result<()> {
    let len = arr.len() as u64;
    writer.write_all(&len.to_le_bytes())?;
    writer.write_all(arr)?;
    writer.flush()?;
    Ok(())
}
