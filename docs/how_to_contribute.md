# How to Contribute

Proof Arena is an open platform for benchmarking zero-knowledge (ZK) algorithms, and we welcome contributions from the community. Whether you're interested in proposing a new problem or contributing a solution, this guide will walk you through the process.

## How to Contribute a Problem

Contributing a problem allows you to define new challenges that will be used to benchmark ZK algorithms. Follow these steps to submit a problem:

1. **Fork the Repository**: Start by forking the [Proof Arena GitHub repository](https://github.com/PolyhedraZK/proof-arena) to your GitHub account.

2. **Create a New Problem File**:

   - Navigate to the `problems` directory.
   - Create a new directory with a descriptive name for your problem.
   - Inside this directory, create a `problem.md` file. This file should a header of following format:

   ![Problem Header format](https://storage.googleapis.com/proof-cloud-assets/problem-header.png)

   - Fill in the header with the appropriate information for your problem.
   - Write a detailed description of the problem in markdown format, typically including the following sections:
     - **Problem Description**: A detailed description of the problem, including any relevant background information.
     - **Interaction Instruction**: Instructions for how the prover should interact with the special judge program (SPJ).
     - **Test Vectors**: Provide example inputs and expected outputs to help others test their solutions.
     - **References**: Include any references or links to related materials.

   You should also write a special judge program (SPJ) to interact with the prover. The SPJ will provide inputs and check outputs, as well as invoke the verifier to check the proof. Please check our sample SPJ code in the [Proof Arena GitHub repository](https://github.com/PolyhedraZK/proof-arena/tree/main/problems/keccak256_hash/spj).

   You need to define how a prover should interact with the SPJ in the "Interaction Instruction" section of your problem file. This will include steps for the prover to follow when receiving inputs and sending outputs.

3. **Submit a Pull Request**:

   - Once your problem file and SPJ is ready, commit the changes to your forked repository.
   - Open a pull request (PR) against the main `Proof Arena` repository, providing a clear and concise explanation of your problem.

4. **Community Review**:

   - Your problem submission will be reviewed by the community and the Proof Arena maintainers.
   - Address any feedback provided during the review process.

5. **Approval and Integration**:

   - Once your problem is approved, it will be merged into the main repository and become available for benchmarking.

## How to Contribute a Solution

Contributing a solution involves submitting a ZK prover algorithm that can solve one or more of the problems listed on Proof Arena. Here's how to do it:

1. **Understand the Problem**:

   - Visit the [Proof Arena website](https://proofarena.org) and review the problems currently available.
   - Choose a problem that you want to solve, and make sure you understand the input/output requirements and any specific constraints.

2. **Prepare Your Prover**:

   - Implement your prover algorithm, ensuring it meets the API standards specified in by the SPJ and [Proof Arena GitHub repository](https://github.com/PolyhedraZK/proof-arena).
   - While submitting the source code is optional, it is encouraged to enhance transparency and reproducibility.
   - **Verifier Code**: Submitting your verifier code is mandatory, as it will be audited to ensure correctness.

3. **Test Locally**:

   - Before submitting, run your prover locally to verify it works correctly with the provided test vectors.
   - Ensure that your prover meets the performance requirements for the task.

4. **Submit Your Prover**:

   - Create a directory for your prover within the `problems/YOUR_CHOSEN_PROBLEM/YOUR_PROVER_NAME` directory in your forked repository.
   - Include all necessary files: binaries, verifier code, and documentation.
   - Submit a pull request to the main repository with your prover solution.

5. **Benchmarking Process**:

   - Once your prover is accepted, it will be run on the Main CPU Judger or the Main GPU Judger, depending on the problem requirements.
   - The results, including time and memory usage, will be automatically displayed on the Proof Arena website.

6. **Engage with Feedback**:

   - The community may provide feedback on your prover’s performance. Be prepared to discuss and iterate on your submission if necessary.

7. **Stay Involved**:
   - Monitor the performance of your prover over time, and consider submitting updates or optimizations as new hardware or techniques become available.
