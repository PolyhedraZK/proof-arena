pub mod circuit;
mod config;
#[cfg(test)]
mod tests;

/// Log2 of the number of rows in the polynomial
pub const LOG_DEGREE: usize = 20;
/// Number of Keccak-f rounds per hash operation
pub const NUM_ROUNDS: usize = 24;
/// Number of Halo2 rows required per Keccak round
pub const NUM_ROWS_PER_ROUND: usize = 300;

/// Maximum number of hashes supported with this setup
/// Calculated as: (1 << LOG_DEGREE) / NUM_ROUNDS / NUM_ROWS_PER_ROUND = 145
/// Set to 136 to allow for some buffer rows
pub const MAX_NUM_HASHES: usize = 136;
