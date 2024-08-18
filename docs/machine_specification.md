## Provider
- **Main CPU Judge**: Google Cloud  `c3d-standard-90` (Your prover can only use 64 cores for simplicity.)
- **Main GPU Judge**: Coming soon

## c3d-standard-90
### CPU
- **Architecture**: x86_64
- **CPU op-modes**: 32-bit, 64-bit
- **Address sizes**: 52 bits physical, 57 bits virtual
- **Byte Order**: Little Endian
- **Total CPUs**: 90 (Maximum usable by your prover: 64 cores)
  - **On-line CPU(s) list**: 0-89
- **Vendor ID**: AuthenticAMD
  - **Model name**: AMD EPYC 9B14
  - **CPU family**: 25
  - **Model**: 17
  - **Thread(s) per core**: 2
  - **Core(s) per socket**: 45
  - **Socket(s)**: 1
  - **Stepping**: 1
  - **BogoMIPS**: 5199.99
- **Flags**: 
  - fpu, vme, de, pse, tsc, msr, pae, mce, cx8, apic, sep, mtrr, pge, mca, cmov, pat, pse36, clflush, mmx, fxsr, sse, sse2, ht, syscall, nx, mmxext, fxsr_opt, pdpe1gb, rdtscp, lm, constant_tsc, rep_good, nopl, nonstop_tsc, cpuid, extd_apicid, tsc_known_freq, pni, pclmulqdq, ssse3, fma, cx16, pcid, sse4_1, sse4_2, x2apic, movbe, popcnt, aes, xsave, avx, f16c, rdrand, hypervisor, lahf_lm, cmp_legacy, cr8_legacy, abm, sse4a, misalignsse, 3dnowprefetch, osvw, topoext, invpcid_single, ssbd, ibrs, ibpb, stibp, vmmcall, fsgsbase, tsc_adjust, bmi1, avx2, smep, bmi2, erms, invpcid, avx512f, avx512dq, rdseed, adx, smap, avx512ifma, clflushopt, clwb, avx512cd, sha_ni, avx512bw, avx512vl, xsaveopt, xsavec, xgetbv1, xsaves, avx512_bf16, clzero, xsaveerptr, wbnoinvd, arat, avx512vbmi, umip, avx512_vbmi2, gfni, vaes, vpclmulqdq, avx512_vnni, avx512_bitalg, avx512_vpopcntdq, rdpid, fsrm
- **Virtualization features**:
  - **Hypervisor vendor**: KVM
  - **Virtualization type**: Full

### Caches (Sum of All)

- **L1d**: 1.4 MiB (45 instances)
- **L1i**: 1.4 MiB (45 instances)
- **L2**: 45 MiB (45 instances)
- **L3**: 192 MiB (6 instances)

### NUMA

- **NUMA node(s)**: 1
- **NUMA node0 CPU(s)**: 0-89

### Memory

- **Total Memory**: 353.92 GB
- **Memory Configuration**: 22 DIMMs
  - 21 × 16 GB DIMMs (Synchronous, 64-bit width, DIMM)
  - 1 × 8 GB DIMM (Synchronous, 64-bit width, DIMM)