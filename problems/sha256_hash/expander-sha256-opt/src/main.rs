#[global_allocator]
static GLOBAL: mimalloc::MiMalloc = mimalloc::MiMalloc;

// migrated from: https://github.com/PolyhedraZK/ExpanderCompilerCollection/blob/939cccbe0ff25a3f7c9dc2129131be3124c63589/expander_compiler/tests/keccak_gf2_full.rs
use arith::{Field, FieldSerde};
use expander_compiler::frontend::*;
use expander_rs::Proof;
use expander_sha256_opt::*;
use internal::Serde;
use rayon::prelude::*;
use sha2::{Digest, Sha256};
use std::{
    fs::File,
    io::{BufReader, Cursor, Write},
    thread,
};

declare_circuit!(SHA256Circuit {
    input: [[Variable; 64 * 8]; N_HASHES],
    output: [[Variable; 256]; N_HASHES], // TODO: use public inputs
});

impl Define<GF2Config> for SHA256Circuit<Variable> {
    fn define(&self, api: &mut API<GF2Config>) {
        for j in 0..N_HASHES {
            let out = compute_sha256(api, &self.input[j].to_vec());
            for i in 0..256 {
                api.assert_is_equal(out[i].clone(), self.output[j][i].clone());
            }
        }
    }
}

fn compute_sha256<C: Config>(api: &mut API<C>, input: &Vec<Variable>) -> Vec<Variable> {
    let h32: [u32; 8] = [
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab,
        0x5be0cd19,
    ];

    let mut h: Vec<Vec<Variable>> = (0..8).map(|x| int2bit(api, h32[x])).collect();

    let k32: [u32; 64] = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4,
        0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe,
        0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f,
        0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
        0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc,
        0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
        0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116,
        0x1e376c48, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa11, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7,
        0xc67178f2,
    ];
    //    let k: Vec<Vec<Variable>> = (0..64).map(|x| int2bit(api, k32[x])).collect();

    let mut w = vec![vec![api.constant(0); 32]; 64];
    //    for i in 0..16 {
    //        w[i] = input[(i * 32)..((i + 1) * 32) as usize].to_vec();
    //    }
    // Unrolling the first 16 iterations of the loop
    w[0] = input[0..32].to_vec();
    w[1] = input[32..64].to_vec();
    w[2] = input[64..96].to_vec();
    w[3] = input[96..128].to_vec();
    w[4] = input[128..160].to_vec();
    w[5] = input[160..192].to_vec();
    w[6] = input[192..224].to_vec();
    w[7] = input[224..256].to_vec();
    w[8] = input[256..288].to_vec();
    w[9] = input[288..320].to_vec();
    w[10] = input[320..352].to_vec();
    w[11] = input[352..384].to_vec();
    w[12] = input[384..416].to_vec();
    w[13] = input[416..448].to_vec();
    w[14] = input[448..480].to_vec();
    w[15] = input[480..512].to_vec();

    for i in 16..64 {
        let tmp = xor(
            api,
            rotate_right(&w[i - 15], 7),
            rotate_right(&w[i - 15], 18),
        );
        let shft = shift_right(api, w[i - 15].clone(), 3);
        let s0 = xor(api, tmp, shft);
        let tmp = xor(
            api,
            rotate_right(&w[i - 2], 17),
            rotate_right(&w[i - 2], 19),
        );
        let shft = shift_right(api, w[i - 2].clone(), 10);
        let s1 = xor(api, tmp, shft);
        let s0 = add(api, w[i - 16].clone(), s0);
        let s1 = add(api, w[i - 7].clone(), s1);
        let s1 = add_const(api, s1, k32[i]);
        w[i] = add(api, s0, s1);
    }

    for i in 0..64 {
        let s1 = sigma1(api, h[4].clone());
        let c = ch(api, h[4].clone(), h[5].clone(), h[6].clone());
        w[i] = add(api, w[i].clone(), h[7].clone());
        let c = add_const(api, c, k32[i].clone());
        let s1 = add(api, s1, w[i].clone());
        let s1 = add(api, s1, c);
        let s0 = sigma0(api, h[0].clone());
        let m = maj(api, h[0].clone(), h[1].clone(), h[2].clone());
        let s0 = add(api, s0, m);

        h[7] = h[6].clone();
        h[6] = h[5].clone();
        h[5] = h[4].clone();
        h[4] = add(api, h[3].clone(), s1.clone());
        h[3] = h[2].clone();
        h[2] = h[1].clone();
        h[1] = h[0].clone();
        h[0] = add(api, s1, s0);
    }

    let mut result = add_const(api, h[0].clone(), h32[0].clone());
    for i in 1..8 {
        result.append(&mut add_const(api, h[i].clone(), h32[i].clone()));
    }

    result
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
    write_string(out_pipe, "expander-sha256-opt")?;
    write_string(out_pipe, "GKR")?;
    write_string(out_pipe, "Expander")?;

    // STEP 3: Prover make all precomputes in this step
    let compile_result = compile(&SHA256Circuit::default()).unwrap();
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
    write_u64(
        out_pipe,
        8 * N_HASHES as u64 * par_factor as u64 * repeat_factor as u64,
    )?;

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
                    let mut assignment = SHA256Circuit::<GF2>::default();
                    for (k, data) in input_bytes.chunks_exact(64).enumerate() {
                        let mut hash = Sha256::new();
                        hash.update(&data);
                        let output = hash.finalize();
                        outputs.extend_from_slice(&output);
                        for i in 0..64 {
                            for j in 0..8 {
                                assignment.input[k % N_HASHES][i * 8 + j] =
                                    ((data[i] >> j) as u32 & 1).into();
                            }
                        }

                        for i in 0..32 {
                            for j in 0..8 {
                                assignment.output[k % N_HASHES][i * 8 + j] =
                                    ((output[i] >> j) as u32 & 1).into();
                            }
                        }
                        if k % N_HASHES == N_HASHES - 1 {
                            assignments.push(assignment);
                            assignment = SHA256Circuit::<GF2>::default();
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
    let all_witness_group = all_witness.chunks(repeat_factor).collect::<Vec<_>>();
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
                                    t |= (witness[rep].values
                                        [j * witness[rep].num_inputs_per_witness + i]
                                        .v as u8)
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
    all_proof_serialized[8..]
        .par_chunks_mut(proof_len + 8)
        .enumerate()
        .for_each(|(i, chunk)| {
            chunk[0..8].copy_from_slice(&(proof_len as u64).to_le_bytes());
            chunk[8..].copy_from_slice(&all_proof[i]);
        });
    println!("Time epoch 2 elapsed: {:?}", start_time_orig.elapsed());
    write_byte_array(out_pipe, &all_proof_serialized)?;
    println!(
        "Time epoch 2.1 elapsed: {:?}, pipe writes: {:?}",
        start_time_orig.elapsed(),
        all_proof_serialized.len()
    );

    let vk = vec![];
    println!("Time epoch 3 elapsed: {:?}", start_time_orig.elapsed());
    write_byte_array(out_pipe, &vk)?;
    println!(
        "Time epoch 3.1 elapsed: {:?}, pipe writes: {:?}",
        start_time_orig.elapsed(),
        vk.len()
    );

    let mut all_pis_serialized = vec![];
    all_pis_serialized.extend_from_slice(&(all_pis.len() as u64).to_le_bytes());
    for pis in all_pis.iter() {
        all_pis_serialized.extend_from_slice(&(pis.len() as u64).to_le_bytes());
        all_pis_serialized.extend_from_slice(pis);
    }
    println!("Time epoch 4 elapsed: {:?}", start_time_orig.elapsed());
    write_byte_array(out_pipe, &all_pis_serialized)?;
    println!(
        "Time epoch 4.1 elapsed: {:?}, pipe writes: {:?}",
        start_time_orig.elapsed(),
        all_pis_serialized.len()
    );

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
                    let (proof, claimed_v) = load_proof_and_claimed_v(
                        full_proof[i * proof_length..(i + 1) * proof_length].as_ref(),
                    );
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
