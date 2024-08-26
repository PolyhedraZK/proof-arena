use ark_std::{end_timer, start_timer, test_rng};
use halo2_proofs::{dev::MockProver, poly::kzg::commitment::ParamsKZG};
use halo2curves::bn256::{Bn256, Fr};
use snark_verifier_sdk::{gen_pk, gen_snark_shplonk, verify_snark_shplonk};

use crate::{circuit::KeccakCircuit, LOG_DEGREE};

/// Test the Keccak circuit using the MockProver
#[test]
fn test_keccak_with_mock_prover() {
    let circuit = KeccakCircuit::mock_for_test();
    let public_input = vec![];
    let mock_prover = MockProver::<Fr>::run(LOG_DEGREE as u32, &circuit, public_input).unwrap();
    mock_prover.assert_satisfied_par();
}

/// Test the Keccak circuit with a real prover
#[test]
fn test_keccak_with_real_prover() {
    let mut rng = test_rng();
    let params = ParamsKZG::<Bn256>::setup(LOG_DEGREE as u32, &mut rng);

    let circuit = KeccakCircuit::mock_for_test();
    let pk = gen_pk(&params, &circuit, None);

    let timer = start_timer!(|| format!("prove {} keccaks", MAX_NUM_HASHES));
    let snark = gen_snark_shplonk(&params, &pk, circuit, &mut rng, None::<String>)
        .expect("Snark generated successfully");
    end_timer!(timer);
    assert!(verify_snark_shplonk::<KeccakCircuit>(
        &params,
        snark,
        pk.get_vk()
    ));
}
