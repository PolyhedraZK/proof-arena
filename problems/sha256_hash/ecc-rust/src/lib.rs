// migrated from: https://github.com/PolyhedraZK/ExpanderCompilerCollection/blob/939cccbe0ff25a3f7c9dc2129131be3124c63589/expander_compiler/tests/keccak_gf2_full.rs
use expander_compiler::frontend::*;
mod spj;
pub use spj::*;

pub fn int2bit<C: Config>(api: &mut API<C>, value: u32) -> Vec<Variable> {
    return (0..32).map(|x| api.constant(((value >> x) & 1) as u32)).collect();
}

pub fn rotate_right(bits: &Vec<Variable>, k: usize) -> Vec<Variable> {
    let n = bits.len();
    let s = k & (n - 1);
    let mut new_bits = bits[s as usize..].to_vec();
    new_bits.append(&mut bits[0..s as usize].to_vec());
    new_bits
}

pub fn shift_right<C: Config>(api: &mut API<C>, bits: Vec<Variable>, k: usize) -> Vec<Variable> {
    let n = bits.len();
    let s = k & (n - 1);
    let mut new_bits = bits[s as usize..].to_vec();
    new_bits.append(&mut vec![api.constant(0); s]);
    new_bits
}

// Ch function: (x AND y) XOR (NOT x AND z)
pub fn ch<C: Config>(api: &mut API<C>, x: Vec<Variable>, y: Vec<Variable>, z: Vec<Variable>) -> Vec<Variable> {
    let xy = and(api, x.clone(), y.clone());
    let not_x = not(api, x.clone());
    let not_xz = and(api, not_x, z.clone());
    
    xor(api, xy, not_xz)
}


// Maj function: (x AND y) XOR (x AND z) XOR (y AND z)
pub fn maj<C: Config>(api: &mut API<C>, x: Vec<Variable>, y: Vec<Variable>, z: Vec<Variable>) -> Vec<Variable> {
    let xy = and(api, x.clone(), y.clone());
    let xz = and(api, x.clone(), z.clone());
    let yz = and(api, y.clone(), z.clone());
    let tmp = xor(api, xy, xz);

    xor(api, tmp, yz)
}

// Sigma0 function: ROTR(x, 2) XOR ROTR(x, 13) XOR ROTR(x, 22)
pub fn sigma0<C: Config>(api: &mut API<C>, x: Vec<Variable>) -> Vec<Variable> {
    let rot2 = rotate_right(&x, 2);
    let rot13 = rotate_right(&x, 13);
    let rot22 = rotate_right(&x, 22);
    let tmp = xor(api, rot2, rot13);

    xor(api, tmp, rot22)
}

// Sigma1 function: ROTR(x, 6) XOR ROTR(x, 11) XOR ROTR(x, 25)
pub fn sigma1<C: Config>(api: &mut API<C>, x: Vec<Variable>) -> Vec<Variable> {
    let rot6 = rotate_right(&x, 6);
    let rot11 = rotate_right(&x, 11);
    let rot25 = rotate_right(&x, 25);
    let tmp = xor(api, rot6, rot11);

    xor(api, tmp, rot25)
}

pub const N_HASHES: usize = 1;

pub fn add_const<C: Config>(api: &mut API<C>, a: Vec<Variable>, b: u32) -> Vec<Variable> {
    let n = a.len();
    let mut c = a.clone();
    let mut ci = api.constant(0);
    for i in 0..n {

        if b >> i & 1 == 1 {
            let p = api.add(a[i].clone(), 1);
            c[i] = api.add(p.clone(), ci.clone());

            ci = api.mul(ci, p);
            ci = api.add(ci, a[i].clone());
        } else {
            c[i] = api.add(c[i], ci.clone());
            ci = api.mul(ci, a[i].clone());
        }
    }
    c
}

fn add_moto<C: Config>(api: &mut API<C>, a: &Vec<Variable>, b: &Vec<Variable>) -> Vec<Variable> {
    let n = a.len();
    let mut c = vec![api.constant(0); 32];
    let mut ci = api.constant(0);
    for i in 0..n {
        let p = api.add(a[i].clone(), b[i].clone());
        let g = api.mul(a[i].clone(), b[i].clone());

        c[i] = api.add(p.clone(), ci.clone());
        ci = api.mul(ci, p);
        ci = api.add(ci, g);
    }
    c
}

fn add_naive<C: Config>(api: &mut API<C>, a: &Vec<Variable>, b: &Vec<Variable>) -> Vec<Variable> {
    let n = a.len();
    let mut c = a.clone();

    let mut amulb = a.clone();
    for i in 0..n {
        amulb[i] =api.mul(a[i].clone(), b[i].clone());
    }

    let mut aaddb = a.clone();
    for i in 0..n {
        aaddb[i] =api.add(a[i].clone(), b[i].clone());
    }

    let mut ci = api.constant(0);
    for i in 0..n {
        c[i] = api.add(aaddb[i].clone(), ci.clone());

        ci = api.mul(ci, aaddb[i]);
        ci = api.add(ci, amulb[i]);
    }
    c
}

fn add_brentkung<C: Config>(api: &mut API<C>, a: &Vec<Variable>, b: &Vec<Variable>, ci: Vec<Variable>) -> Vec<Variable> {
    let mut c = vec![api.constant(0); 32];

    /*
    for i in 0..8 {
        let start = i * 4;
        let end = start + 4;

        let (group_sum, group_carry) = brent_kung_adder_4_bits(api, &a[start..end], &b[start..end], carry);

        sum[start..end].copy_from_slice(&group_sum);
        carry = group_carry;
    }

    (sum, carry)
    */
    c
}

pub fn add<C: Config>(api: &mut API<C>, a: Vec<Variable>, b: Vec<Variable>) -> Vec<Variable> {
    add_moto(api, &a, &b)
//    add_naive(api, &a, &b)
}


pub fn xor<C: Config>(api: &mut API<C>, a: Vec<Variable>, b: Vec<Variable>) -> Vec<Variable> {
    let nbits = a.len();
    let mut bits_res = vec![api.constant(0); nbits];
    for i in 0..nbits {
        bits_res[i] = api.add(a[i].clone(), b[i].clone());
    }
    bits_res
}

pub fn and<C: Config>(api: &mut API<C>, a: Vec<Variable>, b: Vec<Variable>) -> Vec<Variable> {
    let nbits = a.len();
    let mut bits_res = vec![api.constant(0); nbits];
    for i in 0..nbits {
        bits_res[i] = api.mul(a[i].clone(), b[i].clone());
    }
    bits_res
}

pub fn not<C: Config>(api: &mut API<C>, a: Vec<Variable>) -> Vec<Variable> {
    let mut bits_res = vec![api.constant(0); a.len()];
    for i in 0..a.len() {
        bits_res[i] = api.sub(1, a[i].clone());
    }
    bits_res
}
