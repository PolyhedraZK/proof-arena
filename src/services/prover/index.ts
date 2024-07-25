import { get, post, request } from '../Request';
import type {
  IEditProverParams as ICreateProverParams,
  IEditProverParams,
  IGetProverListParams,
  IGetProverListResponse,
  IGetProverTaskListResponse,
  IProverItem,
} from './types';
import { ProverStatusEnum } from './types';

// 创建prover
export function createProver(params: ICreateProverParams) {
  return post<IResponse<string>>('/prover/create', params);
}

// 修改prover
export function editProver(params: IEditProverParams) {
  return post<IResponse<string>>('/prover/update', params);
}

// disable prover
export function disableProver(params: IEditProverParams) {
  return post<IResponse<string>>('/prover/update_status', {
    id: params.id,
    status: ProverStatusEnum.DISABLED,
  });
}

// enable prover
export function enableProver(params: IEditProverParams) {
  return post<IResponse<string>>('/prover/update_status', {
    id: params.id,
    status: ProverStatusEnum.ACTIVE,
  });
}

// 删除prover
export async function deleteProver(params: { id: string }) {
  return request<'string'>('/prover/delete', 'DELETE', { params });
}

// 查询prover列表
export function getProvers(params: IGetProverListParams) {
  return get<IGetProverListResponse>('/prover/list', params);
}


/**
 * 查询prover的详细信息 - 基本信息
 * @param id  prover的id
 * @returns
 */
export async function fetchProverDetail(id: string) {
  const resp = await get<IProverItem>(`/prover/${id}`);
  return resp;
}

/**
 * 查询prove的task数据列表 - 证明历史
 * @returns
 */
export async function listProverTaskList(params: {
  offset: number;
  limit: number;
  api_key?: string;
  prover_id?: string;
  prover_name?: string;
}) {
  const resp = await get<IGetProverTaskListResponse>('/prover/task/list', params);
  return resp;
}

// 添加task
export async function addProverData(data: {
  api_key: string;
  input: string;
  prover_id: string;
  prover_name: string;
}) {
  const resp = await post<string>('/prover/task/create', {
    ...data,
  });
  return resp;
}

// 删除task
export async function deleteProveData(params: {
  task_id: string;
  api_key: string;
  prover_id: string;
  prover_name: string;
}) {
  return request<'string'>('/prover/task/delete', 'DELETE', { data: params });
}

// 取消正在pending的task
export async function cancelProveData(params: {
  task_id: string;
  api_key: string;
  prover_id: string;
  prover_name: string;
}) {
  return post<'string'>('/prover/task/cancel', params);
}
