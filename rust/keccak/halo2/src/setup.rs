//! binary for set ups

use std::io::Write;

use ark_std::{end_timer, start_timer, test_rng};
use halo2_proofs::{
    poly::{commitment::Params, kzg::commitment::ParamsKZG},
    SerdeFormat,
};
use halo2curves::bn256::Bn256;
use keccak_circuit::{circuit::KeccakCircuit, LOG_DEGREE};
use snark_verifier_sdk::gen_pk;

fn main() {
    let mut out = vec![];
    // SRS
    let srs = {
        let timer = start_timer!(|| "setup srs");
        let mut rng = test_rng();
        let params = ParamsKZG::<Bn256>::setup(LOG_DEGREE as u32, &mut rng);
        end_timer!(timer);

        let timer = start_timer!(|| "write srs");
        let mut buf = vec![];
        params.write(&mut buf).unwrap();
        out.write_all(buf.len().to_le_bytes().as_ref()).unwrap();
        out.extend_from_slice(&buf);
        end_timer!(timer);

        params
    };

    // Circuit
    let mock_circuit = {
        let timer = start_timer!(|| "setup mock circuit");
        let circuit = KeccakCircuit::mock_for_test();
        end_timer!(timer);

        let timer = start_timer!(|| "write mock circuit");
        let mut buf = vec![];
        circuit.write(&mut buf).unwrap();
        out.write_all(buf.len().to_le_bytes().as_ref()).unwrap();
        out.extend_from_slice(&buf);
        end_timer!(timer);

        circuit
    };

    // Proving key
    let pk = {
        let timer = start_timer!(|| "generate proving key");
        let pk = gen_pk(&srs, &mock_circuit, None);
        end_timer!(timer);

        let timer = start_timer!(|| "write proving key");
        let mut buf = vec![];
        pk.write(&mut buf, SerdeFormat::RawBytesUnchecked).unwrap();
        out.write_all(buf.len().to_le_bytes().as_ref()).unwrap();
        out.extend_from_slice(&buf);
        end_timer!(timer);
        pk
    };

    // verification key
    {
        let timer = start_timer!(|| "write verification key");
        let mut buf = vec![];
        pk.get_vk()
            .write(&mut buf, SerdeFormat::RawBytesUnchecked)
            .unwrap();
        out.write_all(buf.len().to_le_bytes().as_ref()).unwrap();
        out.extend_from_slice(&buf);
        end_timer!(timer);
    }
    std::io::stdout().write_all(&out).unwrap();
    std::io::stdout().flush().unwrap();
}
