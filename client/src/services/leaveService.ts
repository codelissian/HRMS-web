import { apiClient } from '@/lib/api';
import { LeaveRequest, InsertLeaveRequest, Leave, InsertLeave } from '@shared/schema';
import { FilterRequest, ApiResponse } from '@/types/api';

class LeaveService {
  // Leave Types
  async getLeaveTypes(filters: FilterRequest): Promise<ApiResponse<Leave[]>> {
    return apiClient.post<Leave[]>('/leaves/list', filters);
  }

  async createLeaveType(data: InsertLeave): Promise<ApiResponse<Leave>> {
    return apiClient.post<Leave>('/leaves/create', data);
  }

  async updateLeaveType(data: Partial<Leave> & { id: string }): Promise<ApiResponse<Leave>> {
    return apiClient.put<Leave>('/leaves/update', data);
  }

  async deleteLeaveType(id: string): Promise<ApiResponse<void>> {
    return apiClient.patch<void>('/leaves/delete', { id });
  }

  // Leave Requests
  async getLeaveRequests(filters: FilterRequest): Promise<ApiResponse<LeaveRequest[]>> {
    return apiClient.post<LeaveRequest[]>('/leave-requests/list', filters);
  }

  async getLeaveRequest(id: string): Promise<ApiResponse<LeaveRequest>> {
    return apiClient.post<LeaveRequest>('/leave-requests/one', { id });
  }

  async createLeaveRequest(data: InsertLeaveRequest): Promise<ApiResponse<LeaveRequest>> {
    return apiClient.post<LeaveRequest>('/leave-requests/create', data);
  }

  async updateLeaveRequest(data: Partial<LeaveRequest> & { id: string }): Promise<ApiResponse<LeaveRequest>> {
    return apiClient.put<LeaveRequest>('/leave-requests/update', data);
  }

  async deleteLeaveRequest(id: string): Promise<ApiResponse<void>> {
    return apiClient.patch<void>('/leave-requests/delete', { id });
  }
}

export const leaveService = new LeaveService();