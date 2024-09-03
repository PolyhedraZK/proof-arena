// migrated from: https://github.com/PolyhedraZK/ExpanderCompilerCollection/blob/939cccbe0ff25a3f7c9dc2129131be3124c63589/expander_compiler/tests/keccak_gf2_full.rs

use arith::{Field, FieldSerde};
use expander_compiler::frontend::*;
use expander_keccak::*;
use expander_rs::Proof;
use internal::Serde;
use std::{
    fs::File,
    io::{BufReader, Cursor, Read, Write},
};
use tiny_keccak::Hasher;

declare_circuit!(Keccak256Circuit {
    p: [[Variable; 64 * 8]; N_HASHES],
    out: [[Variable; 256]; N_HASHES], // TODO: use public inputs
});

fn compute_keccak<C: Config>(api: &mut API<C>, p: &Vec<Variable>) -> Vec<Variable> {
    let mut ss = vec![vec![api.constant(0); 64]; 25];
    let mut new_p = p.clone();
    let mut append_data = vec![0; 136 - 64];
    append_data[0] = 1;
    append_data[135 - 64] = 0x80;
    for i in 0..136 - 64 {
        for j in 0..8 {
            new_p.push(api.constant(((append_data[i] >> j) & 1) as u32));
        }
    }
    let mut p = vec![vec![api.constant(0); 64]; 17];
    for i in 0..17 {
        for j in 0..64 {
            p[i][j] = new_p[i * 64 + j].clone();
        }
    }
    ss = xor_in(api, ss, p);
    ss = keccak_f(api, ss);
    copy_out_unaligned(ss, 136, 32)
}

impl Define<GF2Config> for Keccak256Circuit<Variable> {
    fn define(&self, api: &mut API<GF2Config>) {
        for i in 0..N_HASHES {
            let out = api.memorized_simple_call(compute_keccak, &self.p[i].to_vec());
            for j in 0..256 {
                api.assert_is_equal(out[j].clone(), self.out[i][j].clone());
            }
        }
    }
}

const WITNESS_GENERATED_MSG: &str = "witness generated";

// migrated from: https://github.com/PolyhedraZK/Expander/blob/7670d3d63afa754975d85c2efc05a1b3a685f0a7/src/exec.rs
fn dump_proof_and_claimed_v<F: Field + FieldSerde>(proof: &Proof, claimed_v: &F) -> Vec<u8> {
    let mut bytes = Vec::new();

    proof.serialize_into(&mut bytes).unwrap(); // TODO: error propagation
    claimed_v.serialize_into(&mut bytes).unwrap(); // TODO: error propagation

    bytes
}

fn load_proof_and_claimed_v<F: Field + FieldSerde>(bytes: &[u8]) -> (Proof, F) {
    let mut cursor = Cursor::new(bytes);

    let proof = Proof::deserialize_from(&mut cursor).unwrap(); // TODO: error propagation
    let claimed_v = F::deserialize_from(&mut cursor).unwrap(); // TODO: error propagation

    (proof, claimed_v)
}

// input serde

fn dump_inputs<F: Field + FieldSerde>(inputs: &[F]) -> Vec<u8> {
    let mut bytes = Vec::new();

    for x in inputs {
        x.serialize_into(&mut bytes).unwrap(); // TODO: error propagation
    }

    bytes
}

fn load_inputs<F: Field + FieldSerde>(bytes: &[u8]) -> Vec<F> {
    let mut cursor = Cursor::new(bytes);
    let mut inputs = Vec::new();

    while cursor.position() < bytes.len() as u64 {
        inputs.push(F::deserialize_from(&mut cursor).unwrap()); // TODO: error propagation
    }

    inputs
}

fn prove(
    in_pipe: &mut BufReader<File>,
    out_pipe: &mut File,
) -> Result<(), Box<dyn std::error::Error>> {
    // STEP 1: SPJ sends you the pipe filepath that handles the input output communication
    // STEP 2: Output your prover name, proof system name, and algorithm name
    // Note the order here: send the prover name, algorithm name, and proof system name
    write_string(out_pipe, "expander-keccak")?;
    write_string(out_pipe, "GKR")?;
    write_string(out_pipe, "Expander")?;

    // STEP 3: Prover make all precomputes in this step
    let compile_result = compile(&Keccak256Circuit::default()).unwrap();
    let CompileResult {
        witness_solver,
        layered_circuit,
    } = compile_result;
    let mut expander_circuit = layered_circuit
        .export_to_expander::<expander_rs::GF2ExtConfigSha2>()
        .flatten();
    let config =
        expander_rs::Config::<expander_rs::GF2ExtConfigSha2>::new(expander_rs::GKRScheme::Vanilla);
    let mut prover = expander_rs::Prover::new(&config);

    let file = std::fs::File::create("circuit.txt").unwrap();
    let writer = std::io::BufWriter::new(file);
    layered_circuit.serialize_into(writer).unwrap();

    // STEP 4: Output the Number of Keccak Instances
    write_u64(out_pipe, 8 * N_HASHES as u64)?;
    // STEP 5: Read Input Data
    let input_bytes = read_blob(in_pipe)?;
    // println!("Len of input_bytes: {:?}", input_bytes.len());
    // STEP 6: Hash the Data
    let mut all_output = vec![];
    let mut assignments = vec![];
    let mut assignment = Keccak256Circuit::<GF2>::default();
    for (k, data) in input_bytes.chunks_exact(64).enumerate() {
        let mut hash = tiny_keccak::Keccak::v256();
        hash.update(&data);
        let mut output = [0u8; 32];
        hash.finalize(&mut output);
        all_output.extend_from_slice(&output);
        for i in 0..64 {
            for j in 0..8 {
                assignment.p[k % N_HASHES][i * 8 + j] = ((data[i] >> j) as u32 & 1).into();
            }
        }
        for i in 0..32 {
            for j in 0..8 {
                assignment.out[k % N_HASHES][i * 8 + j] = ((output[i] >> j) as u32 & 1).into();
            }
        }
        if k % N_HASHES == N_HASHES - 1 {
            assignments.push(assignment);
            assignment = Keccak256Circuit::<GF2>::default();
        }
    }
    write_byte_array(out_pipe, &all_output)?;
    // STEP 7: Output a String to Indicate Witness Generation Finished
    let witness = witness_solver.solve_witnesses(&assignments).unwrap();
    // currently we have to manually convert witness to expander simd format
    assert_eq!(
        witness.num_inputs_per_witness,
        1 << expander_circuit.log_input_size()
    );
    // let res = layered_circuit.run(&witness);
    expander_circuit.layers[0].input_vals = (0..witness.num_inputs_per_witness)
        .map(|i| {
            let mut t: u8 = 0;
            for j in 0..8 {
                t |= (witness.values[j * witness.num_inputs_per_witness + i].v as u8) << j;
            }
            arith::GF2x8 { v: t }
        })
        .collect();
    expander_circuit.evaluate();
    write_string(out_pipe, WITNESS_GENERATED_MSG)?;
    // STEP 8: Output the Proof
    prover.prepare_mem(&expander_circuit);
    let (claimed_v, proof) = prover.prove(&mut expander_circuit);
    let full_proof = dump_proof_and_claimed_v(&proof, &claimed_v);

    assert!(!full_proof.is_empty()); // sanity check
    write_byte_array(out_pipe, &full_proof)?;
    let vk = vec![];
    write_byte_array(out_pipe, &vk)?;
    let pis = dump_inputs(&expander_circuit.layers[0].input_vals);
    write_byte_array(out_pipe, &pis)?;
    out_pipe.flush()?;
    Ok(())
}

fn verify(
    in_pipe: &mut BufReader<File>,
    out_pipe: &mut File,
    verifier_repeat_num: u64,
) -> Result<(), Box<dyn std::error::Error>> {
    let file = std::fs::File::open("circuit.txt").unwrap();
    let reader = std::io::BufReader::new(file);
    let layered_circuit =
        expander_compiler::circuit::layered::Circuit::<GF2Config>::deserialize_from(reader)
            .unwrap();
    let mut expander_circuit = layered_circuit
        .export_to_expander::<expander_rs::GF2ExtConfigSha2>()
        .flatten();
    let config =
        expander_rs::Config::<expander_rs::GF2ExtConfigSha2>::new(expander_rs::GKRScheme::Vanilla);
    let verifier = expander_rs::Verifier::new(&config);

    // STEP 9: SPJ starts your verifier by providing the pipe filepath that handles the input output communication

    // STEP 10: SPJ sends the proof, verification key, and public input to the verifier
    let proof = read_blob(in_pipe)?;
    let _vk = read_blob(in_pipe)?;
    let pis = read_blob(in_pipe)?;
    // STEP 11: Verify the Proof, and send back result
    let pis = load_inputs::<arith::GF2x8>(&pis);
    let (proof, claimed_v) = load_proof_and_claimed_v(&proof);
    expander_circuit.layers[0].input_vals = pis;

    let mut result = false;
    for _ in 0..verifier_repeat_num {
        let mut c = expander_circuit.clone();
        result = verifier.verify(&mut c, &claimed_v, &proof);
    }
    write_byte_array(out_pipe, &[if result { 0xffu8 } else { 0x00u8 }])?;
    write_byte_array(out_pipe, verifier_repeat_num.to_le_bytes().as_ref())?; // why not number this time?

    out_pipe.flush()?;
    Ok(())
}

fn main() -> std::io::Result<()> {
    // parse arg
    let args = std::env::args().collect::<Vec<String>>();
    // Usage: ./expander-keccak <mode:prove/verify> -toMe <in_pipe> -toSPJ <out_pipe>;
    let mode = &args[1];
    let in_pipe_name = &args[3];
    let mut in_pipe = std::io::BufReader::new(File::open(in_pipe_name)?);
    let out_pipe_name = &args[5];
    let mut out_pipe = File::create(out_pipe_name)?;

    match mode.as_str() {
        "prove" => prove(&mut in_pipe, &mut out_pipe).unwrap(),
        "verify" => verify(&mut in_pipe, &mut out_pipe, 128).unwrap(),
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
