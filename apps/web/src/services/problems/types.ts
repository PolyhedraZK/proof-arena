export interface IGetProblemsListResponse {
  data: IProblems[];
  total: number;
}

// problems详情
export interface IProblems {
  problem_id: number;
  title: string;
  execution_number: number;
  proposer: string;
  create_time: string;
  draft: boolean;
  enable_comments: boolean;
  proposer_icon: string;
  submission_data_path: string;
  details: string;
  track?: 'zk-prover' | 'zkVM';
}

export interface IPSubmissionsTableItem {
  submission_id: number;
  prover_name: string;
  proof_system: string;
  algorithm: string;
  setup_time: number;
  witness_generation_time: number;
  proof_generation_time: number;
  verify_time: number;
  peak_memory: number;
  proof_size: number;
}

export interface IProblemsDetail extends IProblems {
  description: string;
}
