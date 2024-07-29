export interface IGetProblemsListResponse {
  data: IProblems[];
  total: number;
}

// problems详情
export interface IProblems {
  id: number;
  problem_name: string;
  execution_number: number;
  user_name: string;
  create_time: string;
}

export interface IProblemsDetail extends IProblems {
  submissionsTableData: any[];
  description: string;
}
