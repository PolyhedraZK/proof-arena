#![feature(array_methods)]

mod poseidon;
pub use poseidon::*;

#[cfg(test)]
mod test;

pub const N_LOG_INSTANCES: usize = 18;

pub const N_LOG_INSTANCES_PER_ROW: usize = 3;

pub const N_LOG_ROWS: usize = N_LOG_INSTANCES - N_LOG_INSTANCES_PER_ROW;

pub const LOG_EXPAND: u32 = 2;

pub const N_STATE: usize = 16;
