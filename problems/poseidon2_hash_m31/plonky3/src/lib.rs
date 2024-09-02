use ark_std::test_rng;
use p3_challenger::DuplexChallenger;
use p3_commit::ExtensionMmcs;
use p3_dft::Radix2DitParallel;
use p3_field::extension::BinomialExtensionField;
use p3_field::Field;
use p3_fri::{FriConfig, TwoAdicFriPcs};
use p3_koala_bear::{DiffusionMatrixKoalaBear, KoalaBear};
use p3_matrix::dense::DenseMatrix;
use p3_merkle_tree::FieldMerkleTreeMmcs;
use p3_poseidon2::{Poseidon2, Poseidon2ExternalMatrixGeneral};
use p3_poseidon2_air::Poseidon2Air;
use p3_symmetric::{PaddingFreeSponge, TruncatedPermutation};
use p3_uni_stark::{prove, verify, Proof, StarkConfig};

pub const NUM_HASHES: usize = 1 << 16;

pub const WIDTH: usize = 16;

pub const SBOX_DEGREE: usize = 3;

pub const SBOX_REGISTERS: usize = 1;

pub const HALF_FULL_ROUNDS: usize = 4;

pub const PARTIAL_ROUNDS: usize = 20;

pub type MyConfig = StarkConfig<Pcs, Challenge, Challenger>;

type Val = KoalaBear;
type Challenge = BinomialExtensionField<Val, 4>;

type Perm = Poseidon2<Val, Poseidon2ExternalMatrixGeneral, DiffusionMatrixKoalaBear, 16, 3>;

type MyHash = PaddingFreeSponge<Perm, 16, 8, 8>;

type MyCompress = TruncatedPermutation<Perm, 2, 8, 16>;

type ValMmcs =
    FieldMerkleTreeMmcs<<Val as Field>::Packing, <Val as Field>::Packing, MyHash, MyCompress, 8>;

type ChallengeMmcs = ExtensionMmcs<Val, Challenge, ValMmcs>;

type Dft = Radix2DitParallel;

type Challenger = DuplexChallenger<Val, Perm, 16, 8>;

type Pcs = TwoAdicFriPcs<Val, Dft, ValMmcs, ChallengeMmcs>;

pub fn setup() -> (
    Perm,
    MyConfig,
    Poseidon2Air<Val, WIDTH, SBOX_DEGREE, SBOX_REGISTERS, HALF_FULL_ROUNDS, PARTIAL_ROUNDS>,
) {
    let perm = Perm::new_from_rng_128(
        Poseidon2ExternalMatrixGeneral,
        DiffusionMatrixKoalaBear::default(),
        &mut test_rng(),
    );

    let hash = MyHash::new(perm.clone());

    let compress = MyCompress::new(perm.clone());

    let val_mmcs = ValMmcs::new(hash, compress);

    let challenge_mmcs = ChallengeMmcs::new(val_mmcs.clone());

    let dft = Dft {};

    let air: Poseidon2Air<
        Val,
        WIDTH,
        SBOX_DEGREE,
        SBOX_REGISTERS,
        HALF_FULL_ROUNDS,
        PARTIAL_ROUNDS,
    > = Poseidon2Air::new_from_rng(&mut test_rng());

    let fri_config = FriConfig {
        log_blowup: 1,
        num_queries: 100,
        proof_of_work_bits: 16,
        mmcs: challenge_mmcs,
    };
    let pcs = Pcs::new(dft, val_mmcs, fri_config);

    let config = MyConfig::new(pcs);

    (perm, config, air)
}

pub fn prove_poseidon(
    perm: &Perm,
    config: &MyConfig,
    air: &Poseidon2Air<Val, WIDTH, SBOX_DEGREE, SBOX_REGISTERS, HALF_FULL_ROUNDS, PARTIAL_ROUNDS>,
    trace: DenseMatrix<KoalaBear, Vec<KoalaBear>>,
) -> Proof<MyConfig> {
    let mut challenger = Challenger::new(perm.clone());
    prove(config, air, &mut challenger, trace, &vec![])
}

pub fn verify_poseidon(
    perm: &Perm,
    config: &MyConfig,
    air: &Poseidon2Air<Val, WIDTH, SBOX_DEGREE, SBOX_REGISTERS, HALF_FULL_ROUNDS, PARTIAL_ROUNDS>,
    proof: Proof<MyConfig>,
) -> bool {
    let mut challenger = Challenger::new(perm.clone());
    match verify(config, air, &mut challenger, &proof, &vec![]) {
        Ok(_) => true,
        Err(_e) => false,
    }
}
