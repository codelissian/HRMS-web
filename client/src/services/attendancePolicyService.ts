import { apiClient } from '@/lib/api';
import { 
  AttendancePolicy, 
  CreateAttendancePolicyRequest, 
  UpdateAttendancePolicyRequest, 
  ListAttendancePoliciesRequest,
  AttendancePoliciesResponse 
} from '@/types/attendance';
import { API_ENDPOINTS } from '@/services/api/endpoints';

export class AttendancePolicyService {
  static async create(data: CreateAttendancePolicyRequest): Promise<AttendancePolicy> {
    const response = await apiClient.post(API_ENDPOINTS.ATTENDANCE_POLICIES_CREATE, data);
    return response.data;
  }

  static async update(data: UpdateAttendancePolicyRequest): Promise<AttendancePolicy> {
    const response = await apiClient.post(API_ENDPOINTS.ATTENDANCE_POLICIES_UPDATE, data);
    return response.data;
  }

  static async list(request: ListAttendancePoliciesRequest): Promise<AttendancePoliciesResponse> {
    const response = await apiClient.post(API_ENDPOINTS.ATTENDANCE_POLICIES_LIST, request);
    return response.data;
  }

  static async getById(id: string): Promise<AttendancePolicy> {
    const response = await apiClient.post(API_ENDPOINTS.ATTENDANCE_POLICIES_ONE, { id });
    return response.data;
  }

  static async delete(id: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.ATTENDANCE_POLICIES_DELETE, { id });
  }
}

export const attendancePolicyService = new AttendancePolicyService();

