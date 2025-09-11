import { httpClient } from '@/lib/httpClient';
import { 
  AttendancePolicy, 
  CreateAttendancePolicyRequest, 
  UpdateAttendancePolicyRequest, 
  ListAttendancePoliciesRequest,
  AttendancePoliciesResponse 
} from '@/types/attendance';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import { ApiResponse } from '@/types/api';

export class AttendancePolicyService {
  static async create(data: CreateAttendancePolicyRequest): Promise<ApiResponse<AttendancePolicy>> {
    const response = await httpClient.post<ApiResponse<AttendancePolicy>>(API_ENDPOINTS.ATTENDANCE_POLICIES_CREATE, data);
    return response.data;
  }

  static async update(data: UpdateAttendancePolicyRequest): Promise<ApiResponse<AttendancePolicy>> {
    const response = await httpClient.post<ApiResponse<AttendancePolicy>>(API_ENDPOINTS.ATTENDANCE_POLICIES_UPDATE, data);
    return response.data;
  }

  static async list(request: ListAttendancePoliciesRequest): Promise<ApiResponse<AttendancePolicy[]>> {
    const response = await httpClient.post<ApiResponse<AttendancePolicy[]>>(API_ENDPOINTS.ATTENDANCE_POLICIES_LIST, request);
    return response.data;
  }

  static async getById(id: string): Promise<ApiResponse<AttendancePolicy>> {
    const response = await httpClient.post<ApiResponse<AttendancePolicy>>(API_ENDPOINTS.ATTENDANCE_POLICIES_ONE, { id });
    return response.data;
  }

  static async delete(id: string): Promise<ApiResponse<void>> {
    const response = await httpClient.patch<ApiResponse<void>>(API_ENDPOINTS.ATTENDANCE_POLICIES_DELETE, { id });
    return response.data;
  }
}

export const attendancePolicyService = new AttendancePolicyService();

