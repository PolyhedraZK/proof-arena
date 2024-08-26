use halo2_proofs::{
    circuit::{Layouter, SimpleFloorPlanner},
    plonk::{Circuit, ConstraintSystem, Error},
};
use halo2curves::bn256::Fr;
use snark_verifier_sdk::CircuitExt;
use tiny_keccak::{Hasher, Keccak};
use zkevm_circuits::{keccak_circuit::keccak_packed_multi::multi_keccak, util::Challenges};

use crate::{
    config::{get_num_rows_per_round, KeccakBenchConfig},
    LOG_DEGREE, MAX_NUM_HASHES, NUM_ROUNDS,
};

/// Represents the Keccak circuit for hashing multiple inputs
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct KeccakCircuit {
    preimages: Vec<[u8; 64]>, // Input data to be hashed
    digests: Vec<[u8; 32]>,   // Resulting hash digests
}

impl KeccakCircuit {
    /// Creates a new KeccakCircuit instance with the given preimages
    pub fn new(preimages: Vec<[u8; 64]>) -> Self {
        let digests = preimages
            .iter()
            .map(|preimage| {
                let mut hasher = Keccak::v256();
                hasher.update(preimage);
                let mut digest = [0u8; 32];
                hasher.finalize(&mut digest);
                digest
            })
            .collect();
        Self { preimages, digests }
    }

    /// Creates a mock circuit for testing purposes
    pub fn mock_for_test() -> Self {
        let preimages = (0..MAX_NUM_HASHES)
            .map(|i| [i as u8; 64])
            .collect::<Vec<_>>();
        Self::new(preimages)
    }

    /// Returns the capacity (number of Keccak-f operations) of this circuit
    pub fn capacity(&self) -> Option<usize> {
        Self::capacity_for_row(LOG_DEGREE)
    }

    /// Calculates the capacity for a given number of rows
    pub fn capacity_for_row(num_rows: usize) -> Option<usize> {
        if num_rows > 0 {
            // Subtract two for unusable rows
            Some(num_rows / ((NUM_ROUNDS + 1) * get_num_rows_per_round()) - 2)
        } else {
            None
        }
    }

    /// Writes the circuit data to the given writer
    pub fn write<W: std::io::Write>(&self, w: &mut W) -> Result<(), std::io::Error> {
        assert_eq!(
            self.preimages.len(),
            self.digests.len(),
            "preimages and digests must be equal"
        );
        w.write_all(&self.preimages.len().to_le_bytes())?;
        for (preimage, digest) in self.preimages.iter().zip(self.digests.iter()) {
            w.write_all(preimage)?;
            w.write_all(digest)?;
        }

        Ok(())
    }
}

impl Circuit<Fr> for KeccakCircuit {
    type Config = (KeccakBenchConfig, Challenges);
    type FloorPlanner = SimpleFloorPlanner;

    fn without_witnesses(&self) -> Self {
        unimplemented!()
    }

    fn configure(meta: &mut ConstraintSystem<Fr>) -> Self::Config {
        let challenges = Challenges::construct_p1(meta);
        let config = KeccakBenchConfig::configure(meta, challenges);
        (config, challenges)
    }

    fn synthesize(
        &self,
        config: Self::Config,
        mut layouter: impl Layouter<Fr>,
    ) -> Result<(), Error> {
        let keccak_capacity = KeccakCircuit::capacity_for_row(1 << LOG_DEGREE);
        let (keccak_config, challenges) = config;
        let preimages = self
            .preimages
            .iter()
            .map(|preimage| preimage.to_vec())
            .collect::<Vec<_>>();

        let challenges = challenges.values(&layouter);
        let witness = multi_keccak(preimages.as_ref(), challenges, keccak_capacity)?;

        keccak_config
            .keccak_circuit_config
            .load_aux_tables(&mut layouter)?;

        layouter.assign_region(
            || "assign keccak rows",
            |mut region| {
                log::trace!("witness length: {}", witness.len());
                for (offset, keccak_row) in witness.iter().enumerate() {
                    let _row = keccak_config.keccak_circuit_config.set_row(
                        &mut region,
                        offset,
                        keccak_row,
                    )?;
                }
                Ok(())
            },
        )?;
        Ok(())
    }
}

impl CircuitExt<Fr> for KeccakCircuit {}
