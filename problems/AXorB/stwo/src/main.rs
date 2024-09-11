#![feature(portable_simd)]

use std::{
    fs::File,
    io::{BufReader, Read, Write},
    simd::u32x16,
};

use serde::{Deserialize, Serialize};
use stwo_prover::{
    constraint_framework::TraceLocationAllocator,
    core::{
        air::Component,
        backend::simd::SimdBackend,
        channel::Blake2sChannel,
        fields::qm31::SecureField,
        pcs::{CommitmentSchemeProver, CommitmentSchemeVerifier, PcsConfig, TreeVec},
        poly::circle::{CanonicCoset, PolyOps},
        prover::{prove, verify, StarkProof},
        vcs::blake2_merkle::{Blake2sMerkleChannel, Blake2sMerkleHasher},
        ColumnVec,
    },
};
use stwo_xor_prover::{
    generate_constant_trace, generate_interaction_trace, generate_trace, XorAccumulator,
    XorElements, XorTableComponent, XorTableEval,
};

const WITNESS_GENERATED_MSG: &str = "witness generated";

const ELEM_BITS: u32 = 8;
const EXPAND_BITS: u32 = 0;
const XOR_TABLE_MAX_LOG_SIZE: u32 = 16;

#[derive(Debug, Serialize, Deserialize)]
pub struct WrappedProof {
    pub proof: StarkProof<Blake2sMerkleHasher>,
    pub claimed_sum: SecureField,
    pub sizes: TreeVec<ColumnVec<u32>>,
}

fn prove_main(
    in_pipe: &mut BufReader<File>,
    out_pipe: &mut File,
) -> Result<(), Box<dyn std::error::Error>> {
    // STEP 1: SPJ sends you the pipe filepath that handles the input output communication
    // STEP 2: Output your prover name, proof system name, and algorithm name
    // Note the order here: send the prover name, algorithm name, and proof system name
    write_string(out_pipe, "STWO XOR Prover")?;
    write_string(out_pipe, "STARK")?;
    write_string(out_pipe, "STWO")?;

    // STEP 3: Prover make all precomputes in this step

    let config = PcsConfig::default();
    // Precompute twiddles.
    let log_max_rows = XOR_TABLE_MAX_LOG_SIZE;
    let twiddles = SimdBackend::precompute_twiddles(
        CanonicCoset::new(log_max_rows + 1 + config.fri_config.log_blowup_factor)
            .circle_domain()
            .half_coset,
    );
    // Setup protocol.
    let prover_channel = &mut Blake2sChannel::default();
    let commitment_scheme =
        &mut CommitmentSchemeProver::<SimdBackend, Blake2sMerkleChannel>::new(config, &twiddles);

    // STEP 4: Output the Number of XOR Bits
    assert!(ELEM_BITS % 8 == 0);
    write_u64(out_pipe, 16 * ELEM_BITS as u64 / 8)?;

    // STEP 5: Read Input Data
    let all_input_bytes_flatten = read_blob(in_pipe)?;

    // STEP 6: Xor the Data
    let lhs = all_input_bytes_flatten[..all_input_bytes_flatten.len() / 2].to_vec();
    let rhs = all_input_bytes_flatten[all_input_bytes_flatten.len() / 2..].to_vec();
    let xor_result = lhs
        .iter()
        .zip(rhs.iter())
        .map(|(l, r)| l ^ r)
        .collect::<Vec<_>>();

    write_byte_array(out_pipe, &xor_result)?;

    // STEP 7: Output a String to Indicate Witness Generation Finished

    // Trace.
    // -- prepare input
    let mut xor_accum = XorAccumulator::<ELEM_BITS, EXPAND_BITS>::default();
    let lhs: [u8; 16] = lhs.try_into().unwrap();
    let rhs: [u8; 16] = rhs.try_into().unwrap();
    let lhs = u32x16::from_slice(&lhs.map(|x| x as u32));
    let rhs = u32x16::from_slice(&rhs.map(|x| x as u32));
    xor_accum.add_input(lhs, rhs);

    let (trace, lookup_data) = generate_trace(xor_accum);
    // println!("trace: {:?}", trace);
    // -- commit
    let mut tree_builder = commitment_scheme.tree_builder();
    tree_builder.extend_evals(trace);
    tree_builder.commit(prover_channel);

    // Draw lookup element
    let elements = XorElements::draw(prover_channel);

    // Interaction trace.
    let (interaction_trace, claimed_sum) = generate_interaction_trace(lookup_data, &elements);
    let mut tree_builder = commitment_scheme.tree_builder();
    tree_builder.extend_evals(interaction_trace);
    tree_builder.commit(prover_channel);

    // Constant trace.
    let mut tree_builder = commitment_scheme.tree_builder();
    let constant_trace = generate_constant_trace::<ELEM_BITS, EXPAND_BITS>();
    tree_builder.extend_evals(constant_trace);
    tree_builder.commit(prover_channel);

    // Prove constraints.
    let tree_span_provider = &mut TraceLocationAllocator::default();
    let component = XorTableComponent::<ELEM_BITS, EXPAND_BITS>::new(
        tree_span_provider,
        XorTableEval::<ELEM_BITS, EXPAND_BITS> {
            lookup_elements: elements.clone(),
            claimed_sum,
        },
    );

    write_string(out_pipe, WITNESS_GENERATED_MSG)?;

    // STEP 8: Output the Proof

    let proof = prove::<SimdBackend, Blake2sMerkleChannel>(
        &[&component],
        prover_channel,
        commitment_scheme,
    )
    .unwrap();

    let proof_serialized = bincode::serialize(&WrappedProof {
        proof,
        claimed_sum,
        sizes: component.trace_log_degree_bounds(),
    })?;
    write_byte_array(out_pipe, &proof_serialized)?;

    let vk = vec![];
    write_byte_array(out_pipe, &vk)?;

    let pis = vec![];
    write_byte_array(out_pipe, &pis)?;

    out_pipe.flush()?;
    Ok(())
}

fn verify_main(
    in_pipe: &mut BufReader<File>,
    out_pipe: &mut File,
    verifier_repeat_num: u64,
) -> Result<(), Box<dyn std::error::Error>> {
    let config = PcsConfig::default();

    // STEP 9: SPJ starts your verifier by providing the pipe filepath that handles the input output communication

    // STEP 10: SPJ sends the proof, verification key, and public input to the verifier
    let proof_serialized = read_blob(in_pipe)?;
    let _vk = read_blob(in_pipe)?;
    let _pis = read_blob(in_pipe)?;

    // STEP 11: Verify the Proof, and send back result

    let mut final_result = true;
    for _ in 0..verifier_repeat_num {
        let verifier_channel = &mut Blake2sChannel::default();
        let commitment_scheme = &mut CommitmentSchemeVerifier::<Blake2sMerkleChannel>::new(config);
        let WrappedProof {
            proof,
            claimed_sum,
            sizes,
        } = bincode::deserialize(&proof_serialized)?;
        // Retrieve the expected column sizes in each commitment interaction, from the AIR.
        commitment_scheme.commit(proof.commitments[0], &sizes[0], verifier_channel);
        // Draw interaction elements.
        let elements = XorElements::draw(verifier_channel);
        // Interaction trace.
        commitment_scheme.commit(proof.commitments[1], &sizes[1], verifier_channel);
        // Constant trace.
        commitment_scheme.commit(proof.commitments[2], &sizes[2], verifier_channel);
        let tree_span_provider = &mut TraceLocationAllocator::default();
        let component = XorTableComponent::<ELEM_BITS, EXPAND_BITS>::new(
            tree_span_provider,
            XorTableEval::<ELEM_BITS, EXPAND_BITS> {
                lookup_elements: elements.clone(),
                claimed_sum,
            },
        );
        let result = verify(&[&component], verifier_channel, commitment_scheme, proof).is_ok();
        final_result &= result;
    }

    write_byte_array(out_pipe, &[if final_result { 0xffu8 } else { 0x00u8 }])?;
    write_byte_array(out_pipe, verifier_repeat_num.to_le_bytes().as_ref())?; // why not number this time?

    out_pipe.flush()?;
    Ok(())
}

fn main() -> std::io::Result<()> {
    // parse arg
    let args = std::env::args().collect::<Vec<String>>();
    // Usage: ./stwo-xor-prover <mode:prove/verify> -toMe <in_pipe> -toSPJ <out_pipe>;
    let mode = &args[1];
    let in_pipe_name = &args[3];
    let mut in_pipe = std::io::BufReader::new(File::open(in_pipe_name)?);
    let out_pipe_name = &args[5];
    let mut out_pipe = File::create(out_pipe_name)?;

    match mode.as_str() {
        "prove" => prove_main(&mut in_pipe, &mut out_pipe).unwrap(),
        "verify" => verify_main(&mut in_pipe, &mut out_pipe, 2).unwrap(),
        _ => panic!("Invalid mode: {}", mode),
    }
    Ok(())
}

// Helper functions for SPJ communication, copied from https://github.com/sixbigsquare/proof-arena-pcbin/blob/1693b9c5d934d2364ebc259f5e413a7609cc4c27/problems/keccak256_hash/halo2/src/prover.rs

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
