use ark_std::{end_timer, start_timer, test_rng};
use halo2_proofs::{dev::MockProver, poly::kzg::commitment::ParamsKZG};
use halo2curves::bn256::{Bn256, Fr};
use snark_verifier_sdk::{gen_pk, gen_snark_shplonk, verify_snark_shplonk};

use crate::{circuit::XorCircuit, LOG_DEGREE};

#[test]
fn test_xor_with_mock_prover() {
    {
        let circuit = XorCircuit::mock_for_test();
        let public_input = vec![];
        let mock_prover = MockProver::<Fr>::run(LOG_DEGREE as u32, &circuit, public_input).unwrap();
        mock_prover.assert_satisfied_par();
    }

    {
        let mut circuit = XorCircuit::mock_for_test();
        circuit.output[0] = if circuit.output[0] == Fr::zero() {
            Fr::one()
        } else {
            Fr::zero()
        };
        let public_input = vec![];
        let mock_prover = MockProver::<Fr>::run(LOG_DEGREE as u32, &circuit, public_input).unwrap();
        assert!(mock_prover.verify().is_err());
    }
}

#[test]
fn test_xor_with_real_prover() {
    let mut rng = test_rng();
    let params = ParamsKZG::<Bn256>::setup(LOG_DEGREE as u32, &mut rng);

    let circuit = XorCircuit::mock_for_test();
    let pk = gen_pk(&params, &circuit, None);
    let timer = start_timer!(|| format!("prove {} Xors", VECTOR_LENGTH));

    let snark = gen_snark_shplonk(&params, &pk, circuit, &mut rng, None::<String>)
        .expect("Snark generated successfully");
    end_timer!(timer);

    assert!(verify_snark_shplonk::<XorCircuit>(
        &params,
        snark,
        pk.get_vk()
    ));
}
