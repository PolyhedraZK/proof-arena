use halo2_proofs::plonk::ConstraintSystem;
use halo2curves::bn256::Fr;
use zkevm_circuits::{
    keccak_circuit::{KeccakCircuitConfig, KeccakCircuitConfigArgs},
    table::KeccakTable,
    util::{Challenges, SubCircuitConfig},
};

use crate::NUM_ROWS_PER_ROUND;

#[derive(Clone, Debug)]
pub struct KeccakBenchConfig {
    pub(crate) keccak_circuit_config: KeccakCircuitConfig<Fr>,
}

impl KeccakBenchConfig {
    pub(crate) fn configure(meta: &mut ConstraintSystem<Fr>, challenges: Challenges) -> Self {
        // hash configuration
        let challenges_exprs = challenges.exprs(meta);
        let keccak_table = KeccakTable::construct(meta);
        let keccak_circuit_config_args = KeccakCircuitConfigArgs {
            keccak_table: keccak_table.clone(),
            challenges: challenges_exprs,
        };

        Self {
            keccak_circuit_config: KeccakCircuitConfig::new(meta, keccak_circuit_config_args),
        }
    }
}

/// Obtain the rows required for 1 iteration of f-box's inner round
/// function (consisting of 5 phases) within Keccak circuit
pub fn get_num_rows_per_round() -> usize {
    NUM_ROWS_PER_ROUND
}
