export const problemsListData = {
  data: [
    {
      id: 1001,
      execution_number: 1002,
      problem_name: 'Keccak Keccak Keccak 256 Hash',
      user_name: 'Polyhedra Network',
      user_avatar: 'https://stake.polyhedra.foundation/logo.png',
      create_time: 'Jul 15, 2024, 16:58:53 (UTC+08:00)',
    },
    {
      id: 1002,
      execution_number: 6732,
      problem_name: 'Poseidon2 Hash M31',
      user_name: 'Polyhedra Network',
      user_avatar: 'https://stake.polyhedra.foundation/logo.png',
      create_time: 'Jul 15, 2024, 18:58:53 (UTC+08:00)',
    },
    {
      id: 1003,
      execution_number: 3600,
      problem_name: 'ECDSA Signature',
      user_name: 'Polyhedra Network',
      user_avatar: 'https://stake.polyhedra.foundation/logo.png',
      create_time: 'Jul 15, 2024, 18:59:53 (UTC+08:00)',
    },
  ],
  total: 3,
};

export const problemsDetailData = [
  {
    id: 1001,
    execution_number: 1002,
    problem_name: 'Keccak Keccak Keccak 256 Hash',
    user_name: 'Polyhedra Network',
    user_avatar: 'https://stake.polyhedra.foundation/logo.png',
    create_time: 'Jul 15, 2024, 16:58:53 (UTC+08:00)',
    desc: "Your prover program must read bytes from stdin and print bytes to stdout. We will use a special judge program (SPJ) to interact with your prover by providing inputs and checking outputs. The SPJ communicates with the prover through the prover's stdin and stdout. Additionally, the SPJ will invoke your verifier to check your proof.",
    submissionsTableData: [
      {
        id: 1,
        prover_name: 'expander,algo 1',
        proof_system: 'Expander',
        algorithm: 'algo 1',
        status: 'pending',
        setup_time: 3.5,
        witness_generation_time: 3.5,
        proof_generation_time: 3.5,
        verify_time: 3.5,
        peak_memory: 644,
        proof_size: 542,
      },
      {
        id: 2,
        prover_name: 'expander,algo 2',
        proof_system: 'Expander',
        algorithm: 'algo 2',
        status: 'running',
        setup_time: 3.5,
        witness_generation_time: 3.5,
        proof_generation_time: 3.5,
        verify_time: 3.5,
        peak_memory: 644,
        proof_size: 542,
      },
      {
        id: 3,
        prover_name: 'expander,algo 3',
        proof_system: 'Expander',
        algorithm: 'algo 3',
        status: 'completed',
        setup_time: 3.5,
        witness_generation_time: 3.5,
        proof_generation_time: 3.5,
        verify_time: 3.5,
        peak_memory: 644,
        proof_size: 542,
      },
    ],
    chartData: [
      {
        name: 'Setup time',
        value: [
          {
            name: 'alpa-algo1',
            value: 6000,
          },
          {
            name: 'alpa-algo3',
            value: 7500,
          },
          {
            name: 'beta-algo1',
            value: 8000,
          },
          {
            name: 'beta-algo2',
            value: 9500,
          },
          {
            name: 'gamma-algo1',
            value: 10500,
          },
          {
            name: 'gamma-algo2',
            value: 4121,
          },
          {
            name: 'gamma-algo3',
            value: 5143,
          },
        ],
      },
      {
        name: 'Witness generation time',
        value: [
          {
            name: 'alpa-algo1',
            value: 6000,
          },
          {
            name: 'alpa-algo3',
            value: 7500,
          },
          {
            name: 'beta-algo1',
            value: 8000,
          },
          {
            name: 'beta-algo2',
            value: 9500,
          },
          {
            name: 'gamma-algo1',
            value: 10500,
          },
          {
            name: 'expander,algo 6',
            value: 2121,
          },
          {
            name: 'expander,algo 7',
            value: 2143,
          },
        ],
      },
      {
        name: 'Proof generation time',
        value: [
          {
            name: 'expander,algo 1',
            value: 3798,
          },
          {
            name: 'expander,algo 2',
            value: 3106,
          },
          {
            name: 'alpa-algo1',
            value: 6000,
          },
          {
            name: 'alpa-algo3',
            value: 7500,
          },
          {
            name: 'beta-algo1',
            value: 8000,
          },
          {
            name: 'beta-algo2',
            value: 9500,
          },
          {
            name: 'gamma-algo1',
            value: 10500,
          },
        ],
      },
      {
        name: 'Verification time',
        value: [
          {
            name: 'alpa-algo1',
            value: 6000,
          },
          {
            name: 'alpa-algo3',
            value: 7500,
          },
          {
            name: 'beta-algo1',
            value: 8000,
          },
          {
            name: 'beta-algo2',
            value: 9500,
          },
          {
            name: 'gamma-algo1',
            value: 10500,
          },
          {
            name: 'expander,algo 7',
            value: 3143,
          },
        ],
      },
      {
        name: 'Peak memory',
        value: [
          {
            name: 'expander,algo 1',
            value: 7008,
          },
          {
            name: 'alpa-algo1',
            value: 6000,
          },
          {
            name: 'alpa-algo3',
            value: 7500,
          },
          {
            name: 'beta-algo1',
            value: 8000,
          },
          {
            name: 'beta-algo2',
            value: 9500,
          },
          {
            name: 'gamma-algo1',
            value: 10500,
          },
          {
            name: 'expander,algo 6',
            value: 121,
          },
        ],
      },
      {
        name: 'proof size',
        value: [
          {
            name: 'expander,algo 1',
            value: 7855,
          },
          {
            name: 'alpa-algo1',
            value: 6000,
          },
          {
            name: 'alpa-algo3',
            value: 7500,
          },
          {
            name: 'beta-algo1',
            value: 8000,
          },
          {
            name: 'beta-algo2',
            value: 9500,
          },
          {
            name: 'gamma-algo1',
            value: 10500,
          },
          {
            name: 'expander,algo 7',
            value: 1430,
          },
        ],
      },
    ],
  },
  {
    id: 1002,
    execution_number: 6732,
    problem_name: 'Poseidon2 Hash M31',
    user_name: 'Polyhedra Network',
    user_avatar: 'https://stake.polyhedra.foundation/logo.png',
    create_time: 'Jul 15, 2024, 18:58:53 (UTC+08:00)',
    desc: "Your prover program must read bytes from stdin and print bytes to stdout. We will use a special judge program (SPJ) to interact with your prover by providing inputs and checking outputs. The SPJ communicates with the prover through the prover's stdin and stdout. Additionally, the SPJ will invoke your verifier to check your proof.",
    submissionsTableData: [
      {
        id: 1,
        prover_name: 'expander,algo 1',
        proof_system: 'Expander',
        algorithm: 'algo 1',
        status: 'pending',
        setup_time: 3.5,
        witness_generation_time: 3.5,
        proof_generation_time: 3.5,
        verify_time: 3.5,
        peak_memory: 644,
        proof_size: 542,
      },
      {
        id: 2,
        prover_name: 'expander,algo 2',
        proof_system: 'Expander',
        algorithm: 'algo 2',
        status: 'running',
        setup_time: 3.5,
        witness_generation_time: 3.5,
        proof_generation_time: 3.5,
        verify_time: 3.5,
        peak_memory: 644,
        proof_size: 542,
      },
      {
        id: 3,
        prover_name: 'expander,algo 3',
        proof_system: 'Expander',
        algorithm: 'algo 3',
        status: 'completed',
        setup_time: 3.5,
        witness_generation_time: 3.5,
        proof_generation_time: 3.5,
        verify_time: 3.5,
        peak_memory: 644,
        proof_size: 542,
      },
    ],
    chartData: [
      {
        name: 'Setup time',
        value: [
          {
            name: 'alpa-algo1',
            value: 6000,
          },
          {
            name: 'alpa-algo3',
            value: 7500,
          },
          {
            name: 'beta-algo1',
            value: 8000,
          },
          {
            name: 'beta-algo2',
            value: 9500,
          },
          {
            name: 'gamma-algo1',
            value: 10500,
          },
          {
            name: 'gamma-algo2',
            value: 4121,
          },
          {
            name: 'gamma-algo3',
            value: 5143,
          },
        ],
      },
      {
        name: 'Witness generation time',
        value: [
          {
            name: 'alpa-algo1',
            value: 6000,
          },
          {
            name: 'alpa-algo3',
            value: 7500,
          },
          {
            name: 'beta-algo1',
            value: 8000,
          },
          {
            name: 'beta-algo2',
            value: 9500,
          },
          {
            name: 'gamma-algo1',
            value: 10500,
          },
          {
            name: 'expander,algo 6',
            value: 2121,
          },
          {
            name: 'expander,algo 7',
            value: 2143,
          },
        ],
      },
      {
        name: 'Proof generation time',
        value: [
          {
            name: 'expander,algo 1',
            value: 3798,
          },
          {
            name: 'expander,algo 2',
            value: 3106,
          },
          {
            name: 'alpa-algo1',
            value: 6000,
          },
          {
            name: 'alpa-algo3',
            value: 7500,
          },
          {
            name: 'beta-algo1',
            value: 8000,
          },
          {
            name: 'beta-algo2',
            value: 9500,
          },
          {
            name: 'gamma-algo1',
            value: 10500,
          },
        ],
      },
      {
        name: 'Verification time',
        value: [
          {
            name: 'alpa-algo1',
            value: 6000,
          },
          {
            name: 'alpa-algo3',
            value: 7500,
          },
          {
            name: 'beta-algo1',
            value: 8000,
          },
          {
            name: 'beta-algo2',
            value: 9500,
          },
          {
            name: 'gamma-algo1',
            value: 10500,
          },
          {
            name: 'expander,algo 7',
            value: 3143,
          },
        ],
      },
      {
        name: 'Peak memory',
        value: [
          {
            name: 'expander,algo 1',
            value: 7008,
          },
          {
            name: 'alpa-algo1',
            value: 6000,
          },
          {
            name: 'alpa-algo3',
            value: 7500,
          },
          {
            name: 'beta-algo1',
            value: 8000,
          },
          {
            name: 'beta-algo2',
            value: 9500,
          },
          {
            name: 'gamma-algo1',
            value: 10500,
          },
          {
            name: 'expander,algo 6',
            value: 121,
          },
        ],
      },
      {
        name: 'proof size',
        value: [
          {
            name: 'expander,algo 1',
            value: 7855,
          },
          {
            name: 'alpa-algo1',
            value: 6000,
          },
          {
            name: 'alpa-algo3',
            value: 7500,
          },
          {
            name: 'beta-algo1',
            value: 8000,
          },
          {
            name: 'beta-algo2',
            value: 9500,
          },
          {
            name: 'gamma-algo1',
            value: 10500,
          },
          {
            name: 'expander,algo 7',
            value: 1430,
          },
        ],
      },
    ],
  },
  {
    id: 1003,
    execution_number: 3600,
    problem_name: 'ECDSA Signature',
    user_name: 'Polyhedra Network',
    user_avatar: 'https://stake.polyhedra.foundation/logo.png',
    create_time: 'Jul 15, 2024, 18:59:53 (UTC+08:00)',
    desc: "Your prover program must read bytes from stdin and print bytes to stdout. We will use a special judge program (SPJ) to interact with your prover by providing inputs and checking outputs. The SPJ communicates with the prover through the prover's stdin and stdout. Additionally, the SPJ will invoke your verifier to check your proof.",
    submissionsTableData: [
      {
        id: 1,
        prover_name: 'expander,algo 1',
        proof_system: 'Expander',
        algorithm: 'algo 1',
        status: 'pending',
        setup_time: 3.5,
        witness_generation_time: 3.5,
        proof_generation_time: 3.5,
        verify_time: 3.5,
        peak_memory: 644,
        proof_size: 542,
      },
      {
        id: 2,
        prover_name: 'expander,algo 2',
        proof_system: 'Expander',
        algorithm: 'algo 2',
        status: 'running',
        setup_time: 3.5,
        witness_generation_time: 3.5,
        proof_generation_time: 3.5,
        verify_time: 3.5,
        peak_memory: 644,
        proof_size: 542,
      },
      {
        id: 3,
        prover_name: 'expander,algo 3',
        proof_system: 'Expander',
        algorithm: 'algo 3',
        status: 'completed',
        setup_time: 3.5,
        witness_generation_time: 3.5,
        proof_generation_time: 3.5,
        verify_time: 3.5,
        peak_memory: 644,
        proof_size: 542,
      },
    ],
    chartData: [
      {
        name: 'Setup time',
        value: [
          {
            name: 'alpa-algo1',
            value: 6000,
          },
          {
            name: 'alpa-algo3',
            value: 7500,
          },
          {
            name: 'beta-algo1',
            value: 8000,
          },
          {
            name: 'beta-algo2',
            value: 9500,
          },
          {
            name: 'gamma-algo1',
            value: 10500,
          },
          {
            name: 'gamma-algo2',
            value: 4121,
          },
          {
            name: 'gamma-algo3',
            value: 5143,
          },
        ],
      },
      {
        name: 'Witness generation time',
        value: [
          {
            name: 'alpa-algo1',
            value: 6000,
          },
          {
            name: 'alpa-algo3',
            value: 7500,
          },
          {
            name: 'beta-algo1',
            value: 8000,
          },
          {
            name: 'beta-algo2',
            value: 9500,
          },
          {
            name: 'gamma-algo1',
            value: 10500,
          },
          {
            name: 'expander,algo 6',
            value: 2121,
          },
          {
            name: 'expander,algo 7',
            value: 2143,
          },
        ],
      },
      {
        name: 'Proof generation time',
        value: [
          {
            name: 'expander,algo 1',
            value: 3798,
          },
          {
            name: 'expander,algo 2',
            value: 3106,
          },
          {
            name: 'alpa-algo1',
            value: 6000,
          },
          {
            name: 'alpa-algo3',
            value: 7500,
          },
          {
            name: 'beta-algo1',
            value: 8000,
          },
          {
            name: 'beta-algo2',
            value: 9500,
          },
          {
            name: 'gamma-algo1',
            value: 10500,
          },
        ],
      },
    ],
  },
];
