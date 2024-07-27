import { get } from '../Request';
import { IGetProblemsListResponse } from './types';

//查询problemsList
export function getProblemsList(params: any) {
  return get<IGetProblemsListResponse>('/problems/list', params);
}
