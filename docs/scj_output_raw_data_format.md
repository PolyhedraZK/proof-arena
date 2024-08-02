# SPJ Output Data Format

This document specifies the output data format for SPJ (Special Judge) on Proof Arena. The output is submitted to <root_project>/spj_output/ by SCJ, which runs on a Google Cloud Machine with 64 vCPUs and 512 GB RAM. These data will be collected and displayed in the submission section for corresponding problems. Each submission file is named following this convention: <problem_id>-<prover_name>.json. Please ensure the file name is unique.

## SPC Output JSON Schema


```
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "problem_id": {
      "type": "integer",
      "description": "Unique identifier for the problem"
    },
    "prover_name": {
      "type": "string",
      "description": "Name of the prover and algorithm used"
    },
    "proof_system": {
      "type": "string",
      "description": "Name of the proof system"
    },
    "algorithm": {
      "type": "string",
      "description": "Name of the algorithm"
    },
    "setup_time": {
      "type": "number",
      "description": "Time taken for setup in seconds"
    },
    "witness_generation_time": {
      "type": "number",
      "description": "Time taken for witness generation in seconds"
    },
    "proof_generation_time": {
      "type": "number",
      "description": "Time taken for proof generation in seconds"
    },
    "verify_time": {
      "type": "number",
      "description": "Time taken for verification in seconds"
    },
    "peak_memory": {
      "type": "integer",
      "description": "Peak memory usage in megabytes"
    },
    "proof_size": {
      "type": "integer",
      "description": "Size of the proof in kilobytes"
    }
  },
  "required": [
    "problem_id",
    "prover_name",
    "proof_system",
    "algorithm",
    "setup_time",
    "witness_generation_time",
    "proof_generation_time",
    "verify_time",
    "peak_memory",
    "proof_size"
  ]
}
```

# Example of SPC Output in JSON
```json
{
  "problem_id": 1, 
  "prover_name": "Alpha,algo 1",
  "proof_system": "Alpha",
  "algorithm": "algo 1",
  "setup_time": 3.5,
  "witness_generation_time": 3.5,
  "proof_generation_time": 3.5,
  "verify_time": 3.5,
  "peak_memory": 644,
  "proof_size": 542
}
```