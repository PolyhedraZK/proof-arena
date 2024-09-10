// migrated from: https://github.com/PolyhedraZK/ExpanderCompilerCollection/blob/939cccbe0ff25a3f7c9dc2129131be3124c63589/expander_compiler/tests/keccak_gf2_full.rs

use arith::{Field, FieldSerde};
use expander_compiler::frontend::*;
use expander_keccak::*;
use rayon::prelude::*;
use expander_rs::Proof;
use internal::Serde;
use std::{
    fs::File,
    io::{BufReader, Cursor, Read, Write},
    thread,
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
            let out = compute_keccak(api, &self.p[i].to_vec());
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
    par_factor: usize,
    repeat_factor: usize,
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

    let file = std::fs::File::create("circuit.txt").unwrap();
    let writer = std::io::BufWriter::new(file);
    layered_circuit.serialize_into(writer).unwrap();

    let expander_circuit = layered_circuit
        .export_to_expander::<expander_rs::GF2ExtConfigSha2>()
        .flatten();
    let config =
        expander_rs::Config::<expander_rs::GF2ExtConfigSha2>::new(expander_rs::GKRScheme::Vanilla);

    // prepare mem used later
    let mut all_env = (0..par_factor)
        .map(|_| {
            let mut prover = expander_rs::Prover::new(&config);
            let c = expander_circuit.clone();
            prover.prepare_mem(&c);
            (prover, c)
        })
        .collect::<Vec<_>>();

    // STEP 4: Output the Number of Keccak Instances
    write_u64(out_pipe, 8 * N_HASHES as u64 * par_factor as u64 * repeat_factor as u64)?;

    // STEP 5: Read Input Data
    println!("Start proving");
    let start_time_orig = std::time::Instant::now();
    let all_input_bytes_flatten = read_blob(in_pipe)?;

    // STEP 6: Hash the Data
    let all_input_bytes = all_input_bytes_flatten
        .chunks_exact(64 * 8 * N_HASHES)
        .collect::<Vec<_>>();
    let mut all_output = vec![vec![]; par_factor * repeat_factor];
    let mut all_assignments = vec![vec![]; par_factor * repeat_factor];

    thread::scope(|s| {
        let handles = all_input_bytes
            .iter()
            .zip(all_output.iter_mut())
            .zip(all_assignments.iter_mut())
            .map(|((input_bytes, outputs), assignments)| {
                s.spawn(|| {
                    let mut assignment = Keccak256Circuit::<GF2>::default();
                    for (k, data) in input_bytes.chunks_exact(64).enumerate() {
                        let mut hash = tiny_keccak::Keccak::v256();
                        hash.update(&data);
                        let mut output = [0u8; 32];
                        hash.finalize(&mut output);
                        outputs.extend_from_slice(&output);
                        for i in 0..64 {
                            for j in 0..8 {
                                assignment.p[k % N_HASHES][i * 8 + j] =
                                    ((data[i] >> j) as u32 & 1).into();
                            }
                        }
                        for i in 0..32 {
                            for j in 0..8 {
                                assignment.out[k % N_HASHES][i * 8 + j] =
                                    ((output[i] >> j) as u32 & 1).into();
                            }
                        }
                        if k % N_HASHES == N_HASHES - 1 {
                            assignments.push(assignment);
                            assignment = Keccak256Circuit::<GF2>::default();
                        }
                    }
                })
            })
            .collect::<Vec<_>>();
        handles.into_iter().for_each(|h| h.join().unwrap());
    });
    write_byte_array(out_pipe, &all_output.concat())?;

    // STEP 7: Output a String to Indicate Witness Generation Finished
    let all_witness = all_assignments
        .iter()
        .map(|assignments| witness_solver.solve_witnesses(&assignments).unwrap())
        .collect::<Vec<_>>();
    // group witness by repeat factor witnesses per group
    let all_witness_group = all_witness
        .chunks(repeat_factor).collect::<Vec<_>>();
    write_string(out_pipe, WITNESS_GENERATED_MSG)?;

    // STEP 8: Output the Proof
    println!("Time epoch 0 elapsed: {:?}", start_time_orig.elapsed());
    println!("Start proving real");
    let mut all_proof = vec![vec![]; par_factor];
    let mut all_pis = vec![vec![]; par_factor];
    thread::scope(|s| {
        let handles = all_env
            .iter_mut()
            .zip(all_witness_group.iter())
            .zip(all_proof.iter_mut())
            .zip(all_pis.iter_mut())
            .map(|((((prover, c), witness), full_proof), pis)| {
                s.spawn(move || {
                    // currently we have to manually convert witness to expander simd format
                    assert_eq!(witness[0].num_inputs_per_witness, 1 << c.log_input_size());
                    for rep in 0..repeat_factor {
                        c.layers[0].input_vals = (0..witness[rep].num_inputs_per_witness)
                            .map(|i| {
                                let mut t: u8 = 0;
                                for j in 0..8 {
                                    t |= (witness[rep].values[j * witness[rep].num_inputs_per_witness + i].v
                                        as u8)
                                        << j;
                                }
                                arith::GF2x8 { v: t }
                            })
                            .collect();
                        *pis = dump_inputs(&c.layers[0].input_vals);
                        c.evaluate();
                        let (claimed_v, proof) = prover.prove(c);
                        full_proof.append(&mut dump_proof_and_claimed_v(&proof, &claimed_v));
                    }
                    assert!(!full_proof.is_empty()); // sanity check
                })
            })
            .collect::<Vec<_>>();
        handles.into_iter().for_each(|h| h.join().unwrap());
    });
    println!("Proving done");
    println!("Time epoch 1 elapsed: {:?}", start_time_orig.elapsed());

    println!("all_proof.len(): {}", all_proof.len());
    println!("all_proof[0].len(): {}", all_proof[0].len());

    let proof_len = all_proof[0].len();
    let total_len = 8 + all_proof.len() * (8 + proof_len);

    let mut all_proof_serialized = vec![0u8; total_len];
    // Write the lengths
    all_proof_serialized[0..8].copy_from_slice(&(all_proof.len() as u64).to_le_bytes());

    // Use par_chunks_mut instead of for_each_with
    all_proof_serialized[8..].par_chunks_mut(proof_len + 8).enumerate().for_each(|(i, chunk)| {
        chunk[0..8].copy_from_slice(&(proof_len as u64).to_le_bytes());
        chunk[8..].copy_from_slice(&all_proof[i]);
    });
    println!("Time epoch 2 elapsed: {:?}", start_time_orig.elapsed());
    write_byte_array(out_pipe, &all_proof_serialized)?;
    println!("Time epoch 2.1 elapsed: {:?}, pipe writes: {:?}", start_time_orig.elapsed(), all_proof_serialized.len());

    let vk = vec![];
    println!("Time epoch 3 elapsed: {:?}", start_time_orig.elapsed());
    write_byte_array(out_pipe, &vk)?;
    println!("Time epoch 3.1 elapsed: {:?}, pipe writes: {:?}", start_time_orig.elapsed(), vk.len());

    let mut all_pis_serialized = vec![];
    all_pis_serialized.extend_from_slice(&(all_pis.len() as u64).to_le_bytes());
    for pis in all_pis.iter() {
        all_pis_serialized.extend_from_slice(&(pis.len() as u64).to_le_bytes());
        all_pis_serialized.extend_from_slice(pis);
    }
    println!("Time epoch 4 elapsed: {:?}", start_time_orig.elapsed());
    write_byte_array(out_pipe, &all_pis_serialized)?;
    println!("Time epoch 4.1 elapsed: {:?}, pipe writes: {:?}", start_time_orig.elapsed(), all_pis_serialized.len());

    out_pipe.flush()?;
    println!("all done");
    Ok(())
}

fn verify(
    in_pipe: &mut BufReader<File>,
    out_pipe: &mut File,
    par_factor: usize,
    repeat_factor: usize,
    verifier_repeat_num: u64,
) -> Result<(), Box<dyn std::error::Error>> {
    let file = std::fs::File::open("circuit.txt").unwrap();
    let reader = std::io::BufReader::new(file);
    let layered_circuit =
        expander_compiler::circuit::layered::Circuit::<GF2Config>::deserialize_from(reader)
            .unwrap();
    let expander_circuit = layered_circuit
        .export_to_expander::<expander_rs::GF2ExtConfigSha2>()
        .flatten();
    let config =
        expander_rs::Config::<expander_rs::GF2ExtConfigSha2>::new(expander_rs::GKRScheme::Vanilla);

    // STEP 9: SPJ starts your verifier by providing the pipe filepath that handles the input output communication

    // STEP 10: SPJ sends the proof, verification key, and public input to the verifier
    let all_proof_serialized = read_blob(in_pipe)?;
    let _vk = read_blob(in_pipe)?;
    let all_pis_serialized = read_blob(in_pipe)?;

    let mut all_full_proof = vec![];
    let all_full_proof_len = u64::from_le_bytes(all_proof_serialized[..8].try_into().unwrap());
    let mut cur = 8;
    for _ in 0..all_full_proof_len {
        let len = u64::from_le_bytes(all_proof_serialized[cur..cur + 8].try_into().unwrap());
        all_full_proof.push(all_proof_serialized[cur + 8..cur + 8 + len as usize].to_vec());
        cur += 8 + len as usize;
    }

    let mut all_pis = vec![];
    let all_pis_len = u64::from_le_bytes(all_pis_serialized[..8].try_into().unwrap());
    cur = 8;
    for _ in 0..all_pis_len {
        let len = u64::from_le_bytes(all_pis_serialized[cur..cur + 8].try_into().unwrap());
        all_pis.push(all_pis_serialized[cur + 8..cur + 8 + len as usize].to_vec());
        cur += 8 + len as usize;
    }

    // STEP 11: Verify the Proof, and send back result

    let mut all_circuit = vec![expander_circuit.clone(); par_factor];
    let mut all_verifier = (0..par_factor)
        .map(|_| expander_rs::Verifier::new(&config))
        .collect::<Vec<_>>();

    let mut final_result = true;
    for _ in 0..verifier_repeat_num {
        let mut all_result = vec![false; par_factor];
        all_full_proof
            .iter()
            .zip(all_pis.iter())
            .zip(all_result.iter_mut())
            .zip(all_circuit.iter_mut())
            .zip(all_verifier.iter_mut())
            .for_each(|((((full_proof, pis), result), c), v)| {
                let proof_length = full_proof.len() / repeat_factor;
                assert!(full_proof.len() % repeat_factor == 0);
                for i in 0..repeat_factor {
                    let (proof, claimed_v) = load_proof_and_claimed_v(full_proof[i * proof_length..(i + 1) * proof_length].as_ref());
                    c.layers[0].input_vals = load_inputs(pis);
                    *result = v.verify(c, &claimed_v, &proof)
                }
            });
        final_result &= all_result.into_iter().all(|x| x);
    }

    write_byte_array(out_pipe, &[if final_result { 0xffu8 } else { 0x00u8 }])?;
    write_byte_array(out_pipe, verifier_repeat_num.to_le_bytes().as_ref())?; // why not number this time?

    out_pipe.flush()?;
    Ok(())
}

fn main() -> std::io::Result<()> {
    // parse arg
    let args = std::env::args().collect::<Vec<String>>();
    // Usage: ./expander-keccak <mode:prove/verify> <par_factor> -toMe <in_pipe> -toSPJ <out_pipe>;
    let mode = &args[1];
    let par_factor: usize = args[2].parse().unwrap();
    let repeat_factor: usize = args[3].parse().unwrap();
    let in_pipe_name = &args[5];
    let mut in_pipe = std::io::BufReader::new(File::open(in_pipe_name)?);
    let out_pipe_name = &args[7];
    let mut out_pipe = File::create(out_pipe_name)?;

    match mode.as_str() {
        "prove" => prove(&mut in_pipe, &mut out_pipe, par_factor, repeat_factor).unwrap(),
        "verify" => verify(&mut in_pipe, &mut out_pipe, par_factor, repeat_factor, 2).unwrap(),
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
