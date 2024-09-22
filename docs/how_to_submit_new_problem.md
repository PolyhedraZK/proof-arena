Proof Arena is an open platform for benchmarking zero-knowledge (ZK) algorithms, and we welcome contributions from the community. This guide will walk you through the process of proposing a new problem.

## How to Contribute a Problem

Contributing a problem allows you to define new challenges for benchmarking ZK algorithms. Follow these steps:

1. **Fork the Repository**: Start by forking the [Proof Arena GitHub repository](https://github.com/PolyhedraZK/proof-arena) to your GitHub account.

2. **Create a New Problem Directory**:

   - Navigate to the `problems` directory.
   - Create a new directory with a descriptive name for your problem.
   - Inside this directory, create a `problem.md` file with the following header format:

     ```yaml
     ---
     problem_id: [Unique Problem ID]
     title: [Problem Title]
     description: [Brief Description]
     draft: false
     enable_comments: true
     proposer: [Your Name or Organization]
     proposer_icon: [Path to Your Icon (24x24)]
     ---
     ```

   - Fill in the header with appropriate information.
   - Write a detailed problem description in Markdown format, including:

     - **Problem Description**: Detailed explanation with background information.
     - **Interaction Instructions**: How the prover should interact with the Special Judge Program (SPJ).
     - **Test Vectors**: Example inputs and expected outputs.
     - **References**: Any relevant links or materials.

   - Write a Special Judge Program (SPJ) to interact with the prover. The SPJ will provide inputs, check outputs, and invoke the verifier. Refer to our [sample SPJ code](https://github.com/PolyhedraZK/proof-arena/tree/main/problems/keccak256_hash/SPJ).

3. **Submit a Pull Request**:

   - Commit your changes to your forked repository.
   - Open a Pull Request (PR) to the main Proof Arena repository with a clear explanation of your problem.

4. **Community Review**:

   - Your submission will be reviewed by the community and maintainers.
   - Address any feedback during the review process.

5. **Approval and Integration**:

   - Once approved, your problem will be merged and made available on the platform.

## Notes

- **Branching and Permissions**:

  - You may not have permission to push directly to the main branch.
  - All changes should be submitted via fork and Pull Requests.

- **Feedback Loop**:

  - If you encounter issues with the process or need assistance, feel free to comment in your Pull Request.
  - Engage with maintainers and the community for support.

For detailed instructions on how to interact with the SPJ, refer to the [How to Interact with SPJ](https://github.com/PolyhedraZK/proof-arena/blob/main/docs/how_to_interact_with_SPJ.md) document.
