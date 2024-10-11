use std::io::{Read, Write};
// Helper functions for SPJ communication, copied from https://github.com/sixbigsquare/proof-arena-pcbin/blob/1693b9c5d934d2364ebc259f5e413a7609cc4c27/problems/keccak256_hash/halo2/src/prover.rs

/// Writes a string to the given writer
pub fn write_string<W: Write>(writer: &mut W, s: &str) -> std::io::Result<()> {
    let len = s.len() as u64;
    writer.write_all(&len.to_le_bytes())?;
    writer.write_all(s.as_bytes())?;
    writer.flush()?;
    Ok(())
}

/// Writes a u64 to the given writer
pub fn write_u64<W: Write>(writer: &mut W, n: u64) -> std::io::Result<()> {
    writer.write_all(&n.to_le_bytes())?;
    writer.flush()?;
    Ok(())
}

/// Writes a byte array to the given writer
pub fn write_byte_array<W: Write>(writer: &mut W, arr: &[u8]) -> std::io::Result<()> {
    let len = arr.len() as u64;
    writer.write_all(&len.to_le_bytes())?;
    writer.write_all(arr)?;
    Ok(())
}

/// Reads a blob of data from the given reader
pub fn read_blob<R: Read>(reader: &mut R) -> std::io::Result<Vec<u8>> {
    let mut len_buf = [0u8; 8];
    reader.read_exact(&mut len_buf)?;
    let len = u64::from_le_bytes(len_buf);

    let mut buf = vec![0u8; len as usize];
    reader.read_exact(&mut buf)?;
    Ok(buf)
}