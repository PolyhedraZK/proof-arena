use std::ops::{Add, AddAssign, Mul, Sub};

use itertools::Itertools;
use serde::{Deserialize, Serialize};
use stwo_prover::constraint_framework::logup::LogupTraceGenerator;
use stwo_prover::constraint_framework::TraceLocationAllocator;
use stwo_prover::core::air::Component;
use stwo_prover::core::backend::simd::qm31::PackedSecureField;
use stwo_prover::core::fields::qm31::SecureField;
use stwo_prover::core::pcs::{
    CommitmentSchemeProver, CommitmentSchemeVerifier, PcsConfig, TreeVec,
};
use stwo_prover::core::poly::twiddles::TwiddleTree;
use stwo_prover::core::prover::{prove, verify, StarkProof};
use stwo_prover::core::vcs::blake2_merkle::Blake2sMerkleHasher;
use stwo_prover::core::{
    backend::{
        simd::{
            column::BaseColumn,
            m31::{PackedBaseField, LOG_N_LANES},
            SimdBackend,
        },
        Col, Column,
    },
    channel::Blake2sChannel,
    fields::{m31::BaseField, FieldExpOps},
    fri::FriConfig,
    poly::{
        circle::{CanonicCoset, CircleEvaluation, PolyOps},
        BitReversedOrder,
    },
    vcs::blake2_merkle::Blake2sMerkleChannel,
    ColumnVec,
};
use stwo_prover::examples::poseidon::{PoseidonComponent, PoseidonElements, PoseidonEval};

use crate::{LOG_EXPAND, N_LOG_ROWS, N_STATE};

const N_LOG_INSTANCES_PER_ROW: usize = 3;
const N_INSTANCES_PER_ROW: usize = 1 << N_LOG_INSTANCES_PER_ROW;
const N_PARTIAL_ROUNDS: usize = 14;
const N_HALF_FULL_ROUNDS: usize = 4;
const FULL_ROUNDS: usize = 2 * N_HALF_FULL_ROUNDS;
const N_COLUMNS_PER_REP: usize = N_STATE * (1 + FULL_ROUNDS) + N_PARTIAL_ROUNDS;
const N_COLUMNS: usize = N_INSTANCES_PER_ROW * N_COLUMNS_PER_REP;

// TODO(spapini): Pick better constants.
const EXTERNAL_ROUND_CONSTS: [[BaseField; N_STATE]; 2 * N_HALF_FULL_ROUNDS] =
    [[BaseField::from_u32_unchecked(1234); N_STATE]; 2 * N_HALF_FULL_ROUNDS];
const INTERNAL_ROUND_CONSTS: [BaseField; N_PARTIAL_ROUNDS] =
    [BaseField::from_u32_unchecked(1234); N_PARTIAL_ROUNDS];

#[inline(always)]
/// Applies the M4 MDS matrix described in <https://eprint.iacr.org/2023/323.pdf> 5.1.
fn apply_m4<F>(x: [F; 4]) -> [F; 4]
where
    F: Copy + AddAssign<F> + Add<F, Output = F> + Sub<F, Output = F> + Mul<BaseField, Output = F>,
{
    let t0 = x[0] + x[1];
    let t02 = t0 + t0;
    let t1 = x[2] + x[3];
    let t12 = t1 + t1;
    let t2 = x[1] + x[1] + t1;
    let t3 = x[3] + x[3] + t0;
    let t4 = t12 + t12 + t3;
    let t5 = t02 + t02 + t2;
    let t6 = t3 + t5;
    let t7 = t2 + t4;
    [t6, t5, t7, t4]
}

/// Applies the external round matrix.
/// See <https://eprint.iacr.org/2023/323.pdf> 5.1 and Appendix B.
fn apply_external_round_matrix<F>(state: &mut [F; 16])
where
    F: Copy + AddAssign<F> + Add<F, Output = F> + Sub<F, Output = F> + Mul<BaseField, Output = F>,
{
    // Applies circ(2M4, M4, M4, M4).
    for i in 0..4 {
        [
            state[4 * i],
            state[4 * i + 1],
            state[4 * i + 2],
            state[4 * i + 3],
        ] = apply_m4([
            state[4 * i],
            state[4 * i + 1],
            state[4 * i + 2],
            state[4 * i + 3],
        ]);
    }
    for j in 0..4 {
        let s = state[j] + state[j + 4] + state[j + 8] + state[j + 12];
        for i in 0..4 {
            state[4 * i + j] += s;
        }
    }
}

// Applies the internal round matrix.
//   mu_i = 2^{i+1} + 1.
// See <https://eprint.iacr.org/2023/323.pdf> 5.2.
fn apply_internal_round_matrix<F>(state: &mut [F; 16])
where
    F: Copy + AddAssign<F> + Add<F, Output = F> + Sub<F, Output = F> + Mul<BaseField, Output = F>,
{
    // TODO(spapini): Check that these coefficients are good according to section  5.3 of Poseidon2
    // paper.
    let sum = state[1..].iter().fold(state[0], |acc, s| acc + *s);
    state.iter_mut().enumerate().for_each(|(i, s)| {
        // TODO(spapini): Change to rotations.
        *s = *s * BaseField::from_u32_unchecked(1 << (i + 1)) + sum;
    });
}

fn pow5<F: FieldExpOps>(x: F) -> F {
    let x2 = x * x;
    let x4 = x2 * x2;
    x4 * x
}

pub struct LookupData {
    initial_state: [[BaseColumn; N_STATE]; N_INSTANCES_PER_ROW],
    final_state: [[BaseColumn; N_STATE]; N_INSTANCES_PER_ROW],
}

pub fn gen_trace(
    log_size: u32,
    instance_bytes: &[[u32; N_STATE]],
) -> (
    ColumnVec<CircleEvaluation<SimdBackend, BaseField, BitReversedOrder>>,
    LookupData,
) {
    let mut trace = (0..N_COLUMNS)
        .map(|_| Col::<SimdBackend, BaseField>::zeros(1 << log_size))
        .collect_vec();

    let mut lookup_data = LookupData {
        initial_state: std::array::from_fn(|_| {
            std::array::from_fn(|_| BaseColumn::zeros(1 << log_size))
        }),
        final_state: std::array::from_fn(|_| {
            std::array::from_fn(|_| BaseColumn::zeros(1 << log_size))
        }),
    };

    for vec_index in 0..(1 << (log_size - LOG_N_LANES)) {
        // Initial state.
        let mut col_index = 0;
        for rep_i in 0..N_INSTANCES_PER_ROW {
            let mut state: [_; N_STATE] = std::array::from_fn(|state_i| {
                PackedBaseField::from_array(std::array::from_fn(|i| {
                    BaseField::partial_reduce(instance_bytes[state_i][i])
                }))
            });

            state.iter().copied().for_each(|s| {
                trace[col_index].data[vec_index] = s;
                col_index += 1;
            });
            lookup_data.initial_state[rep_i]
                .iter_mut()
                .zip(state)
                .for_each(|(res, state_i)| res.data[vec_index] = state_i);

            // 4 full rounds.
            (0..N_HALF_FULL_ROUNDS).for_each(|round| {
                (0..N_STATE).for_each(|i| {
                    state[i] += PackedBaseField::broadcast(EXTERNAL_ROUND_CONSTS[round][i]);
                });
                apply_external_round_matrix(&mut state);
                state = std::array::from_fn(|i| pow5(state[i]));
                state.iter().copied().for_each(|s| {
                    trace[col_index].data[vec_index] = s;
                    col_index += 1;
                });
            });

            // Partial rounds.
            (0..N_PARTIAL_ROUNDS).for_each(|round| {
                state[0] += PackedBaseField::broadcast(INTERNAL_ROUND_CONSTS[round]);
                apply_internal_round_matrix(&mut state);
                state[0] = pow5(state[0]);
                trace[col_index].data[vec_index] = state[0];
                col_index += 1;
            });

            // 4 full rounds.
            (0..N_HALF_FULL_ROUNDS).for_each(|round| {
                (0..N_STATE).for_each(|i| {
                    state[i] += PackedBaseField::broadcast(
                        EXTERNAL_ROUND_CONSTS[round + N_HALF_FULL_ROUNDS][i],
                    );
                });
                apply_external_round_matrix(&mut state);
                state = std::array::from_fn(|i| pow5(state[i]));
                state.iter().copied().for_each(|s| {
                    trace[col_index].data[vec_index] = s;
                    col_index += 1;
                });
            });

            lookup_data.final_state[rep_i]
                .iter_mut()
                .zip(state)
                .for_each(|(res, state_i)| res.data[vec_index] = state_i);
        }
    }
    let domain = CanonicCoset::new(log_size).circle_domain();
    let trace = trace
        .into_iter()
        .map(|eval| CircleEvaluation::<SimdBackend, _, BitReversedOrder>::new(domain, eval))
        .collect_vec();
    (trace, lookup_data)
}

pub fn gen_interaction_trace(
    log_size: u32,
    lookup_data: LookupData,
    lookup_elements: &PoseidonElements,
) -> (
    ColumnVec<CircleEvaluation<SimdBackend, BaseField, BitReversedOrder>>,
    SecureField,
) {
    let mut logup_gen = LogupTraceGenerator::new(log_size);

    #[allow(clippy::needless_range_loop)]
    for rep_i in 0..N_INSTANCES_PER_ROW {
        let mut col_gen = logup_gen.new_col();
        for vec_row in 0..(1 << (log_size - LOG_N_LANES)) {
            // Batch the 2 lookups together.
            let denom0: PackedSecureField = lookup_elements.combine(
                &lookup_data.initial_state[rep_i]
                    .each_ref()
                    .map(|s| s.data[vec_row]),
            );
            let denom1: PackedSecureField = lookup_elements.combine(
                &lookup_data.final_state[rep_i]
                    .each_ref()
                    .map(|s| s.data[vec_row]),
            );
            // (1 / denom1) - (1 / denom1) = (denom1 - denom0) / (denom0 * denom1).
            col_gen.write_frac(vec_row, denom1 - denom0, denom0 * denom1);
        }
        col_gen.finalize_col();
    }

    logup_gen.finalize()
}

pub fn setup(log_n_instances: u32) -> (PcsConfig, TwiddleTree<SimdBackend>) {
    assert!(log_n_instances >= N_LOG_INSTANCES_PER_ROW as u32);
    let log_n_rows = log_n_instances - N_LOG_INSTANCES_PER_ROW as u32;

    let config = PcsConfig {
        pow_bits: 10,
        fri_config: FriConfig::new(5, 1, 64),
    };

    // Precompute twiddles.
    let twiddles = SimdBackend::precompute_twiddles(
        CanonicCoset::new(log_n_rows + LOG_EXPAND + config.fri_config.log_blowup_factor)
            .circle_domain()
            .half_coset,
    );
    (config, twiddles)
}

pub fn prove_poseidon(
    config: &PcsConfig,
    twiddles: &TwiddleTree<SimdBackend>,
    instance_bytes: &[[u32; N_STATE]],
) -> WrappedProof {
    // Setup protocol.
    let channel = &mut Blake2sChannel::default();
    let commitment_scheme =
        &mut CommitmentSchemeProver::<_, Blake2sMerkleChannel>::new(*config, twiddles);

    // Trace.
    let (trace, lookup_data) = gen_trace(N_LOG_ROWS as u32, instance_bytes);
    let mut tree_builder = commitment_scheme.tree_builder();
    tree_builder.extend_evals(trace);
    tree_builder.commit(channel);

    // Draw lookup elements.
    let lookup_elements = PoseidonElements::draw(channel);

    // Interaction trace.
    let (trace, claimed_sum) =
        gen_interaction_trace(N_LOG_ROWS as u32, lookup_data, &lookup_elements);
    let mut tree_builder = commitment_scheme.tree_builder();
    tree_builder.extend_evals(trace);
    tree_builder.commit(channel);

    // Prove constraints.
    let component = PoseidonComponent::new(
        &mut TraceLocationAllocator::default(),
        PoseidonEval {
            log_n_rows: N_LOG_ROWS as u32,
            lookup_elements,
            claimed_sum,
        },
    );
    let proof = prove::<SimdBackend, _>(&[&component], channel, commitment_scheme).unwrap();

    let sizes = component.trace_log_degree_bounds();

    WrappedProof {
        proof,
        claimed_sum,
        sizes,
    }
}

pub fn verify_poseidon(config: &PcsConfig, wrapped_proof_bytes: &[u8]) -> bool {
    let WrappedProof {
        proof,
        claimed_sum,
        sizes,
    } = bincode::deserialize(wrapped_proof_bytes).unwrap();

    // Verify.
    // TODO: Create Air instance independently.
    let channel = &mut Blake2sChannel::default();
    let commitment_scheme = &mut CommitmentSchemeVerifier::<Blake2sMerkleChannel>::new(*config);

    // Decommit.
    // Retrieve the expected column sizes in each commitment interaction, from the AIR.
    // let sizes = component.trace_log_degree_bounds();
    // Trace columns.
    commitment_scheme.commit(proof.commitments[0], &sizes[0], channel);
    // Draw lookup element.
    let lookup_elements = PoseidonElements::draw(channel);
    // assert_eq!(lookup_elements, component.lookup_elements);

    let component = PoseidonComponent::new(
        &mut TraceLocationAllocator::default(),
        PoseidonEval {
            log_n_rows: N_LOG_ROWS as u32,
            lookup_elements,
            claimed_sum,
        },
    );

    // TODO(spapini): Check claimed sum against first and last instances.
    // Interaction columns.
    commitment_scheme.commit(proof.commitments[1], &sizes[1], channel);

    match verify(&[&component], channel, commitment_scheme, proof) {
        Ok(()) => true,
        Err(_) => false,
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WrappedProof {
    // ZZ: it is quite strange that the proof doesn't implement Clone trait...
    // So we have to pass the serialized proofs around
    pub proof: StarkProof<Blake2sMerkleHasher>,
    pub claimed_sum: SecureField,
    pub sizes: TreeVec<ColumnVec<u32>>,
}
