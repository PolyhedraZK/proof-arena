use ark_std::rand::RngCore;
use ark_std::test_rng;

use crate::poseidon::{prove_poseidon, setup, verify_poseidon};
use crate::{N_LOG_INSTANCES, N_STATE};

#[test]
fn test_simd_poseidon_prove() {
    let mut rng = test_rng();

    let instance_bytes = (0..1 << N_LOG_INSTANCES)
        .map(|_| {
            let mut res = [0u32; N_STATE];
            res.iter_mut().for_each(|r| *r = rng.next_u32());
            res
        })
        .collect::<Vec<_>>();

    let (pcs_config, twiddles) = setup(N_LOG_INSTANCES as u32);

    let proof = prove_poseidon(&pcs_config, &twiddles, instance_bytes.as_ref());
    let proof_bytes = bincode::serialize(&proof).unwrap();

    let res = verify_poseidon(&pcs_config, &proof_bytes);
    assert!(res)
}
