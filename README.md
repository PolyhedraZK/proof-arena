# Proof Arena

In recent years, there's been significant advancement in zero-knowledge (ZK) technologies. We're excited to introduce Proof Arena, a platform for benchmarking zero-knowledge (ZK) algorithms with a focus on fairness and comprehensive data. We invite the community to contribute by adding new tasks and algorithms.

With the success of projects like ZCash and zkRollups/zkEVM, many new open-source ZK projects have emerged. However, benchmarking these projects has been challenging. Some projects share impressive numbers without providing sufficient details for result reproduction.

Let's use performance on CPU, GPU, and EVM to identify the best algorithms, rather than relying on potentially misleading claims on social media.

## Goals

1. **Fairness:** Ensuring all benchmarks are conducted in the same standardized environment.
2. **Reproducibility:** Allowing everyone to replicate the results presented in the arena using the standard environment.
3. **Accessibility:** Presenting data in an easy-to-understand manner.
4. **Expandability:** Tracking the latest advancements in the field.
5. **Comprehensiveness:** Benchmarking all aspects of a proving system.
6. **Modernization:** Regularly updating our hardware to keep pace with technological advancements. We welcome hardware companies to submit new hardware requests for benchmarking.

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
| 1 | A Xor B | Hello world problem | Polyhedra Network | Final | [Link](https://proofarena.org/problems/1) |
| 2 | Keccak256 Hash | Test vectors https://emn178.github.io/online-tools/keccak_256.html | Polyhedra Network | Final | [Link](https://proofarena.org/problems/2) |
| 3 | SHA256 Hash | Test vectors https://emn178.github.io/online-tools/sha256.html | Polyhedra Network | Draft | [Link](https://proofarena.org/problems/3) |
| 4 | Poseidon hash (M31) |  | Polyhedra Network | Final | [Link](https://proofarena.org/problems/1) |


## Current Proof Systems

| Number | Proof system name | Inventor | Integration status | Type |
| --- | --- | --- | --- | --- |
| 1 | Expander | Polyhedra Network | Problem 2 | ZK Circuit Prover |
| 2 | Gnark | Consensys | In Progress | ZK Circuit Prover |
| 3 | Halo2 | PSE | Problems 1,2 | ZK Circuit Prover |
| 4 | Plonky3 | Polygon | Problems 1, 2, 3 | ZK Circuit Prover |
| 5 | Stwo | Starkware | Problems 1, 3 | ZK Circuit Prover |
<!-- | 6 | Risc0 | Risc0 | Not started | zkVM | -->
<!-- | 7 | SP1 | Succinct | Not started | zkVM | -->
<!-- | 8 | Boojum (Replica of Plonky2) | zkSync | Not started | ZK Circuit Prover | -->
<!-- | 9 | Valida | Lita Foundation & Polygon | Not started | zkVM | -->
<!-- | 10 | Nexus 2.0 | Nexus | Not started | zkVM | -->

### Thanks

We extend our gratitude to Google Cloud for their support in developing this platform. We also thank Lianmin Zheng for the inspiration and valuable suggestions provided.

### How to Cite Us

If you find our work useful, please cite:

```
@misc{ProofArena,
  title = {Proof Arena},
  year = {2024},
  url = {https://arena.proof.cloud}
}
```
