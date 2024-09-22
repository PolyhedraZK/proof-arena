#![feature(portable_simd)]
#![feature(iter_array_chunks)]
// migrated from: https://github.com/starkware-libs/stwo/tree/215b1cd6b822092c4f4e5e0c815e5c5196086d64/crates/prover/src/examples/blake/xor_table

#![allow(unused)]
//! Xor table component.
//! Generic on `ELEM_BITS` and `EXPAND_BITS`.
//! The table has all triplets of (a, b, a^b), where a, b are in the range [0,2^ELEM_BITS).
//! a,b are split into high and low parts, of size `EXPAND_BITS` and `ELEM_BITS - EXPAND_BITS`
//! respectively.
//! The component itself will hold 2^(2*EXPAND_BITS) multiplicity columns, each of size
//! 2^(ELEM_BITS - EXPAND_BITS).
//! The constant columns correspond only to the smaller table of the lower `ELEM_BITS - EXPAND_BITS`
//! xors: (a_l, b_l, a_l^b_l).
//! The rest of the lookups are computed based on these constant columns.

mod constraints;
mod gen;

use std::simd::u32x16;

use itertools::Itertools;
use num_traits::Zero;
pub use r#gen::{generate_constant_trace, generate_interaction_trace, generate_trace};

use stwo_prover::constraint_framework::logup::{LogupAtRow, LookupElements};
use stwo_prover::constraint_framework::{EvalAtRow, FrameworkComponent, FrameworkEval, InfoEvaluator};
use stwo_prover::core::backend::simd::column::BaseColumn;
use stwo_prover::core::backend::Column;
use stwo_prover::core::fields::qm31::SecureField;
use stwo_prover::core::pcs::{TreeSubspan, TreeVec};

pub fn trace_sizes<const ELEM_BITS: u32, const EXPAND_BITS: u32>() -> TreeVec<Vec<u32>> {
    let component = XorTableEval::<ELEM_BITS, EXPAND_BITS> {
        lookup_elements: LookupElements::<3>::dummy(),
        claimed_sum: SecureField::zero(),
    };
    let info = component.evaluate(InfoEvaluator::default());
    info.mask_offsets
        .as_cols_ref()
        .map_cols(|_| column_bits::<ELEM_BITS, EXPAND_BITS>())
}

const fn limb_bits<const ELEM_BITS: u32, const EXPAND_BITS: u32>() -> u32 {
    ELEM_BITS - EXPAND_BITS
}
pub const fn column_bits<const ELEM_BITS: u32, const EXPAND_BITS: u32>() -> u32 {
    2 * limb_bits::<ELEM_BITS, EXPAND_BITS>()
}

/// Accumulator that keeps track of the number of times each input has been used.
pub struct XorAccumulator<const ELEM_BITS: u32, const EXPAND_BITS: u32> {
    /// 2^(2*EXPAND_BITS) multiplicity columns. Index (al, bl) of column (ah, bh) is the number of
    /// times ah||al ^ bh||bl has been used.
    pub mults: Vec<BaseColumn>,
}
impl<const ELEM_BITS: u32, const EXPAND_BITS: u32> Default
    for XorAccumulator<ELEM_BITS, EXPAND_BITS>
{
    fn default() -> Self {
        Self {
            mults: (0..(1 << (2 * EXPAND_BITS)))
                .map(|_| BaseColumn::zeros(1 << column_bits::<ELEM_BITS, EXPAND_BITS>()))
                .collect_vec(),
        }
    }
}
impl<const ELEM_BITS: u32, const EXPAND_BITS: u32> XorAccumulator<ELEM_BITS, EXPAND_BITS> {
    pub fn add_input(&mut self, a: u32x16, b: u32x16) {
        // Split a and b into high and low parts, according to ELEMENT_BITS and EXPAND_BITS.
        // The high part is the index of the multiplicity column.
        // The low part is the index of the element in that column.
        let al = a & u32x16::splat((1 << limb_bits::<ELEM_BITS, EXPAND_BITS>()) - 1);
        let ah = a >> limb_bits::<ELEM_BITS, EXPAND_BITS>();
        let bl = b & u32x16::splat((1 << limb_bits::<ELEM_BITS, EXPAND_BITS>()) - 1);
        let bh = b >> limb_bits::<ELEM_BITS, EXPAND_BITS>();
        let column_idx = (ah << EXPAND_BITS) + bh;
        let offset = (al << limb_bits::<ELEM_BITS, EXPAND_BITS>()) + bl;

        // Since the indices may collide, we cannot use scatter simd operations here.
        // Instead, loop over packed values.
        for (column_idx, offset) in column_idx.as_array().iter().zip(offset.as_array().iter()) {
            self.mults[*column_idx as usize].as_mut_slice()[*offset as usize].0 += 1;
        }
    }
}

/// Component that evaluates the xor table.
pub type XorTableComponent<const ELEM_BITS: u32, const EXPAND_BITS: u32> =
    FrameworkComponent<XorTableEval<ELEM_BITS, EXPAND_BITS>>;

pub type XorElements = LookupElements<3>;

/// Evaluates the xor table.
pub struct XorTableEval<const ELEM_BITS: u32, const EXPAND_BITS: u32> {
    pub lookup_elements: XorElements,
    pub claimed_sum: SecureField,
}

impl<const ELEM_BITS: u32, const EXPAND_BITS: u32> FrameworkEval
    for XorTableEval<ELEM_BITS, EXPAND_BITS>
{
    fn log_size(&self) -> u32 {
        column_bits::<ELEM_BITS, EXPAND_BITS>()
    }
    fn max_constraint_log_degree_bound(&self) -> u32 {
        column_bits::<ELEM_BITS, EXPAND_BITS>() + 1
    }
    fn evaluate<E: EvalAtRow>(&self, mut eval: E) -> E {
        let xor_eval = constraints::XorTableEval::<'_, _, ELEM_BITS, EXPAND_BITS> {
            eval,
            lookup_elements: &self.lookup_elements,
            logup: LogupAtRow::new(1, self.claimed_sum, self.log_size()),
        };
        xor_eval.eval()
    }
}
