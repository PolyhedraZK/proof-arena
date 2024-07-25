export interface ICreateProverParams {
  account: string;
  prover_name: string;
  description: string;
  binary_path: string;
  data_directory_path: string;
  visibility: number;
  machine_type_id: number;
}

export interface IEditProverParams {
  id: string;
  account: string;
  prover_name: string;
  description: string;
  binary_path: string;
  data_directory_path: string;
  visibility: number;
  machine_type_id: number;
}

export interface IGetProverListParams {
  visibility: 0 | 1; // 0-公开 1-私有
  offset: number;
  limit: number;
  account?: string;
}
export interface IGetProverListResponse {
  data: IProverItem[];
  total: number;
}

// prover详情
export interface IProverItem {
  id: string;
  account: string;
  prover_name: string;
  prover_type: ProveTypeEnum;
  prover_type_name?: string;
  api_key: string;
  description: string;
  binary_path: string;
  data_directory_path: string;
  pk_size: number;
  memory: number;
  r1cs_size: number;
  visibility: number;
  status: ProverStatusEnum;
  create_time: number;
  machine_type_id: number;
}

export type ProveTaskDataType = {
  id: string;
  prover_id: string;
  account: string;
  prover_name: string;
  input: string;
  input_hash: string;
  output_path: string;
  status: number;
  deleted_time: number;
  completed_time: number;
  create_time: number;
  failed_time: number;
  running_time: number;
};

export interface IGetProverTaskListResponse {
  data: ProveTaskDataType[];
  total: number;
}

export enum ProverStatusEnum {
  DISABLED = 0,
  INITIALIZING = 1,
  STARTING = 2,
  ACTIVE = 3,
  FAILED = 4,
}

export enum ProveTaskStatusEnum {
  PENDING = 0,
  RUNNING = 1,
  COMPLETED = 2,
  CANCELED = 3,
  DELETED = 4,
  FAILED = 5,
}

export enum ProveTypeEnum {
  UNDEFINED = 0,
  GNARK = 1,
  EXPANDER = 2,
}
export const ProverTypeNameMap: Record<ProveTypeEnum, string> = {
  0: 'Undefined',
  1: 'Gnark',
  2: 'Expander',
};
