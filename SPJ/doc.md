# Proof Arena SPJ (Special Judge) Documentation

## Overview

The Proof Arena SPJ (Special Judge) is a Go package designed to facilitate the benchmarking and verification of provers and verifiers in a proof system. It provides a standardized framework for running provers and verifiers, measuring their performance, and collecting benchmark results.

## Package Structure

The package consists of the following main components:

1. `spj_template.go`: Contains the main logic for running the SPJ, including the `SPJTemplate` struct and its associated methods.
2. `types.go`: Defines the data types used throughout the package, such as `Config`, `ProblemRequirement`, `ProofData`, and `SPJImplementation`.
3. `pipe_manager.go`: Implements the `PipeManager` struct for managing named pipes used for inter-process communication between the SPJ, prover, and verifier.
4. `logger.go`: Provides a simple logging mechanism with timestamps.
5. `result_collector.go`: Defines the `ResultCollector` struct for collecting and storing benchmark results.
6. `resource_monitor.go`: Implements the `ResourceMonitor` struct for monitoring resource usage (memory and CPU) of the prover and verifier processes.
7. `timer.go`: Provides a simple timer utility for measuring execution times of different stages.

## Usage

To use the Proof Arena SPJ package, follow these steps:

1. Implement the `SPJImplementation` interface, which includes methods for generating test data, verifying results, and getting the problem ID.
2. Create a new instance of `SPJTemplate` by calling `NewSPJTemplate` and passing your `SPJImplementation`.
3. Run the SPJ by calling the `Run` method on the `SPJTemplate` instance.

The SPJ will handle the execution of the prover and verifier, measure their performance, and collect benchmark results. The results will be output as a JSON file.

## Configuration

The SPJ can be configured using command-line flags:

- `prover`: Path to the prover executable.
- `verifier`: Path to the verifier executable.
- `time`: Time limit in seconds.
- `memory`: Memory limit in MB.
- `cpu`: CPU limit (number of cores).
- `largestN`: Instance upper limit in bytes.
- `json`: Path to the output JSON file.
- `judger`: Enable judger mode (disable prints and redirections).

## Inter-Process Communication

The SPJ uses named pipes for inter-process communication between the SPJ, prover, and verifier. The `PipeManager` struct in `pipe_manager.go` handles the creation and management of these pipes.

## Resource Monitoring

The `ResourceMonitor` struct in `resource_monitor.go` is responsible for monitoring the resource usage (memory and CPU) of the prover and verifier processes. It uses the `ps` command to retrieve memory usage information and the `sched_setaffinity` system call to set CPU affinity.

## Benchmark Results

The `ResultCollector` struct in `result_collector.go` collects and stores benchmark results, including setup time, witness generation time, proof generation time, verification time, peak memory usage, proof size, and additional metrics. The results are output as a JSON file.

## Logging and Timing

The package includes a simple logging mechanism (`logger.go`) with timestamps and a timer utility (`timer.go`) for measuring execution times of different stages.

## Dependencies

The Proof Arena SPJ package has the following dependencies:

- `github.com/PolyhedraZK/proof-arena/SPJ/IPCUtils`: A custom package for inter-process communication utilities.
- `golang.org/x/sys/unix`: A package for accessing Unix system calls.

Please ensure that these dependencies are properly installed and configured before running the SPJ.
