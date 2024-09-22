Proof Arena is an open platform for benchmarking zero-knowledge (ZK) algorithms, and we welcome contributions from the community. This guide will walk you through the process of contributing a solution.

## How to Contribute a Solution

Contributing a solution involves submitting a prover that can solve a problem listed on Proof Arena. Follow these steps:

1. **Select a Problem**:

   - Visit the [Proof Arena website](https://proofarena.org) and choose a problem to solve.
   - Ensure you understand the problem's requirements and constraints.

2. **Prepare Your Prover**:

   - Fork the [Proof Arena GitHub repository](https://github.com/PolyhedraZK/proof-arena) to your GitHub account.
   - Implement your prover algorithm, meeting the API standards specified in the SPJ and [Proof Arena GitHub repository](https://github.com/PolyhedraZK/proof-arena).
   - Submitting source code is optional but encouraged for transparency.
   - **Verifier Code**: Submitting your verifier code is mandatory for auditing.

3. **Local Testing**:

   - Test your prover locally with provided test vectors.
   - Ensure your prover meets performance requirements.

4. **Submit Your Prover**:

   - Create a directory for your prover at `problems/[PROBLEM_NAME]/[YOUR_PROVER_NAME]` in your forked repository.
   - Include all necessary files: binaries, verifier code, and documentation.

5. **Trigger Judgement Process**:

   - To trigger the judgement process, start with a specific script path in your pull request message:

     ```
     [script:problems/[PROBLEM_NAME]/[YOUR_PROVER_NAME]/run.sh]
     ```

     For example:

     ```
     [script:problems/keccak256_hash/my_prover/run.sh]
     ```

     If you are ready for review, add `SUBMISSION_READY` to the end of your commit message:

     For example:

     ```
     [script:problems/[PROBLEM_NAME]/[YOUR_PROVER_NAME]/run.sh] SUBMISSION_READY
     ```

6. **Judger Execution**:

   - The Judger will execute the specified script to automate testing and verification.
   - Ensure your script is executable and located at the specified path.

7. **Automatic Email Notification**:

   - If your prover runs successfully and generates updates in the `spj_output/` directory, the Judger will automatically send an email to maintainers.

8. **Automatic Pull Request Creation**:

   - On maintainers' review, if the PR is approved, the Judger will automatically re-judge and create a new PR with the results.
   - The PR will be merged into the main branch, and the prover will be displayed on the platform.

## Notes

- **Judger Requirements**:

  - The Judger looks for the script path in the commit message to determine whether to execute your prover.
  - If the script path is not provided or incorrect, the Judger will terminate gracefully without executing your prover.
  - Ensure your script is executable and compatible with the Judger environment.

- **Branching and Permissions**:

  - You may not have permission to push directly to the main branch.
  - All changes should be submitted via fork and Pull Requests.

- **Feedback Loop**:

  - If you encounter issues with the Judger process or need assistance, feel free to comment in your Pull Request.
  - Engage with maintainers and the community for support.

For detailed instructions on how to interact with the SPJ, refer to the [How to Interact with SPJ](https://github.com/PolyhedraZK/proof-arena/blob/main/docs/how_to_interact_with_SPJ.md) document.
