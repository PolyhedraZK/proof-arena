pub mod circuit;
mod config;
#[cfg(test)]
mod tests;

/// log degree of the polynomial, i.e., number of rows
pub const LOG_DEGREE: usize = 20;
/// number of keccak_f rounds per hash
pub const NUM_ROUNDS: usize = 24;
/// number of halo2 rows required per keccak round
pub const NUM_ROWS_PER_ROUND: usize = 300;

/// max number of hashes supported with this setup
/// (1 << LOG_DEGREE) / NUM_ROUNDS / NUM_ROWS_PER_ROUND = 145
/// Set to 136 to allow for some buffer rows
pub const MAX_NUM_HASHES: usize = 136;
