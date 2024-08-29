pub mod circuit;
pub mod config;

#[cfg(test)]
mod test;

pub const VECTOR_LENGTH: usize = ((1 << LOG_DEGREE) - 10) / 3;

pub const LOG_DEGREE: usize = 15;
