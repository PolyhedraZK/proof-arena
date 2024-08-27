use ark_std::{rand::RngCore, test_rng};
use halo2_proofs::{
    circuit::{Layouter, SimpleFloorPlanner, Value},
    plonk::{Circuit, ConstraintSystem, Error},
};
use halo2curves::bn256::Fr;
use snark_verifier_sdk::CircuitExt;

use crate::{config::VanillaPlonkConfig, VECTOR_LENGTH};

#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct XorCircuit {
    pub(crate) a: Vec<Fr>,
    pub(crate) b: Vec<Fr>,
    pub(crate) output: Vec<Fr>,
}

impl XorCircuit {
    /// Creates a new XorCircuit instance with the given a and b vectors
    pub fn new(a: Vec<bool>, b: Vec<bool>, c: Vec<bool>) -> Self {
        assert_eq!(a.len(), b.len());
        assert_eq!(a.len(), c.len());
        assert_eq!(a.len(), VECTOR_LENGTH);

        a.iter()
            .zip(b.iter())
            .zip(c.iter())
            .for_each(|((a, b), c)| {
                assert!(*c == (*a ^ *b));
            });

        let zero = Fr::zero();
        let one = Fr::one();
        let a = a.iter().map(|x| if *x { one } else { zero }).collect();
        let b = b.iter().map(|x| if *x { one } else { zero }).collect();
        let c = c.iter().map(|x| if *x { one } else { zero }).collect();

        Self { a, b, output: c }
    }

    /// Creates a mock circuit for testing purposes
    pub fn mock_for_test() -> Self {
        let mut rng = test_rng();

        let a: Vec<bool> = (0..VECTOR_LENGTH)
            .map(|_| rng.next_u32() % 2 == 1)
            .collect();
        let b: Vec<bool> = (0..VECTOR_LENGTH)
            .map(|_| rng.next_u32() % 2 == 1)
            .collect();

        let c = a.iter().zip(b.iter()).map(|(a, b)| *a ^ *b).collect();

        Self::new(a, b, c)
    }

    /// Writes the circuit data to the given writer
    pub fn write<W: std::io::Write>(&self, w: &mut W) -> Result<(), std::io::Error> {
        // FIXME: this writes the Fr elements as raw bytes
        // we could have written the booleans instead
        assert_eq!(self.a.len(), self.b.len());
        assert_eq!(self.a.len(), self.output.len());
        w.write_all(&self.a.len().to_le_bytes())?;
        for ((a, b), output) in self.a.iter().zip(self.b.iter()).zip(self.output.iter()) {
            w.write_all(&a.to_bytes())?;
            w.write_all(&b.to_bytes())?;
            w.write_all(&output.to_bytes())?;
        }
        Ok(())
    }
}

impl Circuit<Fr> for XorCircuit {
    type Config = VanillaPlonkConfig;

    type FloorPlanner = SimpleFloorPlanner;

    fn without_witnesses(&self) -> Self {
        unimplemented!()
    }

    fn configure(meta: &mut ConstraintSystem<Fr>) -> Self::Config {
        let config = VanillaPlonkConfig::configure(meta);
        config
    }

    fn synthesize(
        &self,
        config: Self::Config,
        mut layouter: impl Layouter<Fr>,
    ) -> Result<(), Error> {
        let mut offset = 0;
        let mut first_pass = true;
        layouter.assign_region(
            || "xor",
            |mut region| {
                if first_pass {
                    first_pass = false;
                    return Ok(());
                }

                for ((a, b), output) in self.a.iter().zip(self.b.iter()).zip(self.output.iter()) {
                    config.selector.enable(&mut region, offset)?;

                    let _a_cell = region.assign_advice(
                        || "a",
                        config.phase_1_column,
                        offset,
                        || Value::known(*a),
                    )?;
                    offset += 1;

                    let _b_cell = region.assign_advice(
                        || "b",
                        config.phase_1_column,
                        offset,
                        || Value::known(*b),
                    )?;
                    offset += 1;

                    let _output_cell = region.assign_advice(
                        || "output",
                        config.phase_1_column,
                        offset,
                        || Value::known(*output),
                    )?;
                    offset += 1;
                }
                Ok(())
            },
        )?;
        Ok(())
    }
}

impl CircuitExt<Fr> for XorCircuit {}
