use std::{
    fs::File,
    io::{Read, Write},
    path::Path,
};

use ark_std::{end_timer, start_timer, test_rng};
use halo2_proofs::{
    poly::{commitment::Params, kzg::commitment::ParamsKZG},
    SerdeFormat,
};
use halo2curves::bn256::Bn256;
use halo2_keccak_circuit::{circuit::KeccakCircuit, LOG_DEGREE, MAX_NUM_HASHES};
use snark_verifier_sdk::{gen_pk, gen_proof_gwc, gen_snark_gwc};
use tiny_keccak::Hasher;

fn main() -> std::io::Result<()> {
    let mut log_file = File::create("prover.log")?;
    log_file.write_all(b"start \n")?;

    let srs_file_path = "srs_bn256.data";
    let snark_file_path = "keccak_snark.data";
    let pk_file_path = "keccak_pk.data";
    let vk_file_path = "keccak_vk.data";

    let mut rng = test_rng();

    // Get pipe names from command-line arguments
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 3 {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            "Not enough arguments. Usage: prover <spj_to_prover_pipe> <prover_to_spj_pipe>",
        ));
    }

    let spj_to_prover_pipe = &args[1];
    let prover_to_spj_pipe = &args[2];

    writeln!(log_file, "SPJ to Prover pipe: {}", spj_to_prover_pipe)?;
    writeln!(log_file, "Prover to SPJ pipe: {}", prover_to_spj_pipe)?;

    let mut spj_to_prover_pipe = std::io::BufReader::new(File::open(spj_to_prover_pipe)?);
    let mut prover_to_spj_pipe = File::create(prover_to_spj_pipe)?;

    log_file.write_all(b"pipes setup done \n")?;

    // Send prover info to SPJ
    write_string(&mut prover_to_spj_pipe, "Halo2 Keccak Prover")?;
    write_string(&mut prover_to_spj_pipe, "Keccak")?;
    write_string(&mut prover_to_spj_pipe, "Halo2")?;

    // Send N to SPJ (assuming MAX_NUM_HASHES is the N value)
    write_u64(&mut prover_to_spj_pipe, MAX_NUM_HASHES as u64)?;

    // Read witness from SPJ
    let buf = read_blob(&mut spj_to_prover_pipe)?;

    log_file.write_all(format!("buf_len: {:?}\n", buf.len()).as_bytes())?;
    log_file.write_all(format!("buf: {:?}\n", buf[..32].as_ref()).as_bytes())?;

    let (witness, digests) = parse_prover_in(&buf);
    log_file.write_all(b"witness extracted from pipe\n")?;
    write_byte_array(
        &mut prover_to_spj_pipe,
        digests
            .iter()
            .flat_map(|x| x.as_slice())
            .cloned()
            .collect::<Vec<u8>>()
            .as_ref(),
    )?;
    log_file.write_all(b"sending results back to spj\n")?;

    // SRS
    let srs = {
        let srs_exist = Path::new(srs_file_path).exists();
        if srs_exist {
            let timer = start_timer!(|| "read srs");

            let mut srs_file = std::fs::File::open(srs_file_path)?;
            let srs = ParamsKZG::<Bn256>::read(&mut srs_file)?;
            end_timer!(timer);
            log_file.write_all(b"srs loaded\n")?;
            srs
        } else {
            let timer = start_timer!(|| "setup srs");
            let mut rng = test_rng();
            let srs = ParamsKZG::<Bn256>::setup(LOG_DEGREE as u32, &mut rng);
            end_timer!(timer);
            let timer = start_timer!(|| "write srs");
            let mut srs_file = std::fs::File::create(srs_file_path)?;
            srs.write(&mut srs_file)?;
            end_timer!(timer);

            log_file.write_all(b"srs generated\n")?;
            srs
        }
    };

    // Circuit
    let mock_circuit = {
        let timer = start_timer!(|| "setup mock circuit");
        let circuit = KeccakCircuit::mock_for_test();
        end_timer!(timer);
        circuit
    };
    log_file.write_all(b"mock circuit generated\n")?;

    // Proving key
    let pk = gen_pk(&srs, &mock_circuit, Some(Path::new(pk_file_path)));
    log_file.write_all(b"pk generated or loaded\n")?;

    {
        let snark_exist = Path::new(snark_file_path).exists();
        if !snark_exist {
            let timer = start_timer!(|| "mock snark");
            let snark =
                gen_snark_gwc::<KeccakCircuit>(&srs, &pk, mock_circuit, &mut rng, None::<String>)
                    .expect("Snark generated successfully");
            end_timer!(timer);

            let timer = start_timer!(|| "write snark");
            let mut snark_file = std::fs::File::create(snark_file_path)?;
            let snark_serde = serde_json::to_string(&snark)?;
            snark_file.write_all(snark_serde.as_bytes())?;
            end_timer!(timer);
            log_file.write_all(b"a mock snark is generated\n")?;
        } else {
            log_file.write_all(b"a mock snark already exists, skip this step\n")?;
        }
    }

    // verifying key
    let vk = pk.get_vk();
    let mut vk_bytes = vec![];
    vk.write(&mut vk_bytes, SerdeFormat::RawBytesUnchecked)?;
    let timer = start_timer!(|| "write verification key");
    let mut vk_file = std::fs::File::create(vk_file_path)?;
    vk.write(&mut vk_file, SerdeFormat::RawBytesUnchecked)?;
    end_timer!(timer);

    // Notify SPJ that witness is generated
    write_string(&mut prover_to_spj_pipe, "witness generated")?;
    log_file.write_all(b"sending `witness generated` to SPJ\n")?;

    // prove
    let proof = {
        let timer = start_timer!(|| "prove");
        let real_circuit = KeccakCircuit::new(witness.clone());

        let proof = gen_proof_gwc(&srs, &pk, real_circuit, vec![], &mut rng, None)
            .expect("Proof generated successfully");

        end_timer!(timer);
        log_file.write_all(b"proof generated\n")?;
        log_file.write_all(format!("proof len: {:?}\n", proof.len()).as_bytes())?;
        log_file.write_all(format!("proof: {:?}\n", proof[..32].as_ref()).as_bytes())?;
        proof
    };

    // legacy code used for debugging purpuse
    //
    // let mut proof = vec![0u8; 42848];
    // rng.fill_bytes(&mut proof);
    //
    // let mut vk_bytes = vec![0u8; 1160];
    // rng.fill_bytes(&mut vk_bytes);

    // Send proof to SPJ
    log_file.write_all(format!("sending proof to SPJ, size: {}\n", proof.len()).as_bytes())?;
    log_file.write_all(format!("first 32 of proof: {:?}\n", proof[..32].as_ref()).as_bytes())?;
    write_byte_array(&mut prover_to_spj_pipe, &proof)?;

    // Send VK to SPJ (assuming you have access to VK)
    log_file.write_all(format!("sending VK to SPJ, size: {}\n", vk_bytes.len()).as_bytes())?;
    log_file.write_all(format!("first 32 of VK: {:?}\n", vk_bytes[..32].as_ref()).as_bytes())?;
    write_byte_array(&mut prover_to_spj_pipe, &vk_bytes)?;

    // Send public witness to SPJ (assuming you have access to public witness)
    log_file.write_all(
        format!(
            "sending public witnesses to SPJ, size: {}\n",
            witness.len() * 64
        )
        .as_bytes(),
    )?;
    log_file
        .write_all(format!("first 32 of witness: {:?}\n", witness[0][..32].as_ref()).as_bytes())?;
    write_byte_array(
        &mut prover_to_spj_pipe,
        witness
            .iter()
            .flat_map(|x| x.as_slice())
            .cloned()
            .collect::<Vec<u8>>()
            .as_ref(),
    )?;
    log_file.write_all(b"finished\n")?;
    Ok(())
}

fn parse_prover_in(prover_blob: &[u8]) -> (Vec<[u8; 64]>, Vec<[u8; 32]>) {
    let preimages = prover_blob
        .chunks(64)
        .map(|x| {
            let mut arr = [0u8; 64];
            arr.copy_from_slice(x);
            arr
        })
        .collect::<Vec<[u8; 64]>>();
    let digests = preimages
        .iter()
        .map(|x| {
            let mut arr = [0u8; 32];
            let mut keccak = tiny_keccak::Keccak::v256();
            keccak.update(x);
            keccak.finalize(&mut arr);
            arr
        })
        .collect();
    (preimages, digests)
}

// Helper functions for SPJ communication
fn write_string<W: Write>(writer: &mut W, s: &str) -> std::io::Result<()> {
    let len = s.len() as u64;
    writer.write_all(&len.to_le_bytes())?;
    writer.write_all(s.as_bytes())?;
    writer.flush()?;
    Ok(())
}

fn write_u64<W: Write>(writer: &mut W, n: u64) -> std::io::Result<()> {
    writer.write_all(&n.to_le_bytes())?;
    writer.flush()?;
    Ok(())
}

fn write_byte_array<W: Write>(writer: &mut W, arr: &[u8]) -> std::io::Result<()> {
    let len = arr.len() as u64;
    writer.write_all(&len.to_le_bytes())?;
    writer.write_all(arr)?;
    writer.flush()?;
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
