use halo2_proofs::{
    plonk::{Advice, Column, ConstraintSystem, Expression, FirstPhase, Selector},
    poly::Rotation,
};
use halo2curves::bn256::Fr;

#[derive(Debug, Clone, Copy)]
pub struct VanillaPlonkConfig {
    pub(crate) phase_1_column: Column<Advice>,
    pub(crate) selector: Selector,
}

impl VanillaPlonkConfig {
    pub fn configure(meta: &mut ConstraintSystem<Fr>) -> Self {
        let phase_1_column = meta.advice_column_in(FirstPhase);
        meta.enable_equality(phase_1_column);

        let selector = meta.complex_selector();

        let two = Fr::from(2);
        let two_expr = Expression::Constant(two);

        meta.create_gate("vanilla plonk chip", |meta| {
            let a = meta.query_advice(phase_1_column, Rotation::cur());
            let b = meta.query_advice(phase_1_column, Rotation::next());
            let c = meta.query_advice(phase_1_column, Rotation(2));

            let selector = meta.query_selector(selector);

            // c = a ^ b => c = a + b - 2 * a * b
            vec![selector * (a.clone() + b.clone() - two_expr * a * b - c)]
        });

        VanillaPlonkConfig {
            phase_1_column,
            selector,
        }
    }
}
