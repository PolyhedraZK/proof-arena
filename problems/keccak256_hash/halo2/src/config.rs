use halo2_proofs::plonk::ConstraintSystem;
use halo2curves::bn256::Fr;
use zkevm_circuits::{
    keccak_circuit::{KeccakCircuitConfig, KeccakCircuitConfigArgs},
    table::KeccakTable,
    util::{Challenges, SubCircuitConfig},
};

use crate::NUM_ROWS_PER_ROUND;

/// Configuration for the Keccak benchmark circuit
#[derive(Clone, Debug)]
pub struct KeccakBenchConfig {
    pub(crate) keccak_circuit_config: KeccakCircuitConfig<Fr>,
}

impl KeccakBenchConfig {
    /// Configures the KeccakBenchConfig with the given constraint system and challenges
    pub(crate) fn configure(meta: &mut ConstraintSystem<Fr>, challenges: Challenges) -> Self {
        // Create challenge expressions
        let challenges_exprs = challenges.exprs(meta);
        // Construct the Keccak table
        let keccak_table = KeccakTable::construct(meta);
        // Create arguments for the Keccak circuit configuration
        let keccak_circuit_config_args = KeccakCircuitConfigArgs {
            keccak_table: keccak_table.clone(),
            challenges: challenges_exprs,
        };

        Self {
            keccak_circuit_config: KeccakCircuitConfig::new(meta, keccak_circuit_config_args),
        }
    }
}

/// Returns the number of rows required for one iteration of the f-box's inner round function
pub fn get_num_rows_per_round() -> usize {
    NUM_ROWS_PER_ROUND
}
