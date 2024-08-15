# Proof Arena

In recent years, there's been a lot of work on new zero-knowledge (ZK) technologies. We're excited to introduce Proof Arena, a platform for testing ZK algorithms that values fairness and detailed data. We invite everyone to help out by adding new tasks and algorithms.

With the success of projects like ZCash and zkRollups/zkEVM, many new open-source ZK projects have appeared. However, benchmarking these projects has been a challenge. Some projects share impressive numbers without enough details for others to reproduce the results.

Let's use performance on CPU, GPU, and EVM to find the best algorithms, not just claims on social media with misleading numbers only.

## Goals

1. **Fairness:** Ensuring all benchmarks are conducted in the same standardized environment.
2. **Reproducibility:** Allowing everyone to replicate the results presented in the arena using the standard environment.
3. **Accessibility:** Presenting data in an easy-to-understand manner.
4. **Expandability:** Tracking the latest advancements in the field.
5. **Comprehensiveness:** Benchmarking all aspects of a proving system.
6. **Modernization:** Regularly updating our hardware. Hardware companies are welcome to submit new hardware requests; we are open to installing your chip for benchmarking.

Here's a comparison of different benchmarking methods:

| Method | Fairness | Accessibility | Expandability | Reproducibility | Modernization | Comprehensiveness |
| --- | --- | --- | --- | --- | --- | --- |
| Social Media | No | Yes | No | No | No | No |
| GitHub Source Code | Yes | No | Yes | Yes, but not easy to reproduce | No | Yes |
| Pantheon (Celer) | Yes | Yes | No | No | No | Yes |
| Proof Arena | Yes | Yes | Yes | Yes | Yes | Yes |

## How It Works

1. **Visit Proof Arena**: Start by visiting our platform at [Proof Arena](https://proofarena.org). Here, you can explore detailed information about our benchmarking process, current challenges, and the community's contributions.

2. **Understand the Benchmarking Process**: Familiarize yourself with our benchmarking process. Our list of challenges is maintained on [GitHub](https://github.com/PolyhedraZK/proof-arena), where you can view existing tasks and see how benchmarks are structured.

3. **Submit Your Prover**: If you have a prover algorithm to contribute, follow these steps:

   - **Prepare Your Prover**: We prefer binary executables that meet our API standards. You can find the API specifications on our [GitHub repository](https://github.com/PolyhedraZK/proof-arena). While submitting source code is optional, it is encouraged. However, submitting your verifier code is mandatory, as all verifier code will be audited.
   - **Submit Your Prover**: Submit your prover via our GitHub repository by creating a pull request. Include all necessary files and documentation as specified in our submission guidelines.

4. **Run Benchmarks**: Once your prover is submitted and accepted, you can run it on the requested tasks. You will have access to our standard Google Cloud machines to ensure consistency and fairness in benchmarking. The detailed specifications of these machines are available for verification.

5. **View Results**: After running your prover, time and memory measurements will be automatically displayed on the [Proof Arena](https://arena.proof.cloud) website. These results are public, allowing the community to see and compare different provers' performance.

6. **Contribute New Challenges**: If you have ideas for new benchmarking challenges, you can submit them through our GitHub repository. Create a pull request with your proposed challenge, including detailed instructions and requirements.

7. **Engage with the Community**: Engage with other contributors and stay updated on the latest developments by joining discussions on our GitHub repository. Share your insights, provide feedback, and collaborate with others to advance zero-knowledge technology.

By following these steps, you can actively participate in the Proof Arena community, contributing to the development and benchmarking of cutting-edge zero-knowledge algorithms.

## How to Make a New Submission

We are currently developing an automatic submission system. Until it is available, please follow [these instructions](https://github.com/PolyhedraZK/proof-arena/blob/main/docs/how_to_contribute.md).

# List of contributions

## Tasks

| Number | Task Name | Short Description | Proposer | Status | Link |
| --- | --- | --- | --- | --- | --- |
| 1 | Keccak256 Hash | Test vectors https://emn178.github.io/online-tools/keccak_256.html | Polyhedra Network | Draft | [Link](https://github.com/PolyhedraZK/proof-arena/blob/main/problems/keccak256_hash/problem.md) |
| 2 | Poseidon hash (M31) |  | Polyhedra Network | Draft |  |

## Current Proof Systems

| Number | Proof system name | Inventor | Integration status |
| --- | --- | --- | --- |
| 1 | Expander | Polyhedra Network | In Progress |
| 3 | Gnark | Consensys | Tested on problem 1 |
| 4 | Plonky3 | Polygon | In Progress |
| 5 | Stwo | Starkware | In Progress |
| 6 | Risc0 | Risc0 | Not started |
| 7 | SP1 | Succinct | Not started |
| 8 | Boojum (Replica of Plonky2) | zkSync | Not started |

### Thanks

We thank Google Cloud for their support in developing this platform and Lianmin Zheng for inspiring us and giving us valuable suggestions.

### How to Cite Us

If you find our work useful, please cite:

```
@misc{ProofArena,
  title = {Proof Arena},
  year = {2024},
  url = {https://arena.proof.cloud}
}
```

