import { httpClient } from '@/lib/httpClient';
import { 
  WorkDayRule, 
  WorkDayRuleListResponse,
  WorkDayRuleListParams,
  WorkDayRuleFormData
} from '@/types/workDayRule';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import { ApiResponse } from '@/types/api';

export interface CreateWorkDayRuleRequest extends WorkDayRuleFormData {}

export interface UpdateWorkDayRuleRequest extends WorkDayRuleFormData {
  id: string;
}

export class WorkDayRuleService {
  static async create(data: CreateWorkDayRuleRequest): Promise<ApiResponse<WorkDayRule>> {
    const response = await httpClient.post<ApiResponse<WorkDayRule>>(API_ENDPOINTS.WORK_DAY_RULES_CREATE, data);
    return response.data;
  }

  static async update(data: UpdateWorkDayRuleRequest): Promise<ApiResponse<WorkDayRule>> {
    const response = await httpClient.put<ApiResponse<WorkDayRule>>(API_ENDPOINTS.WORK_DAY_RULES_UPDATE, data);
    return response.data;
  }

  static async list(request: WorkDayRuleListParams): Promise<WorkDayRuleListResponse> {
    const response = await httpClient.post<WorkDayRuleListResponse>(API_ENDPOINTS.WORK_DAY_RULES_LIST, request);
    return response.data;
  }

  static async getById(id: string): Promise<ApiResponse<WorkDayRule>> {
    const response = await httpClient.post<ApiResponse<WorkDayRule>>(API_ENDPOINTS.WORK_DAY_RULES_ONE, { id });
    return response.data;
  }

  static async delete(id: string): Promise<ApiResponse<void>> {
    const response = await httpClient.patch<ApiResponse<void>>(API_ENDPOINTS.WORK_DAY_RULES_DELETE, { id });
    return response.data;
  }
}

export const workDayRuleService = new WorkDayRuleService();