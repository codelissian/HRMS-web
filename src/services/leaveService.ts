import { apiClient } from '@/lib/api';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import { LeaveRequest, InsertLeaveRequest, Leave, InsertLeave } from '@shared/schema';
import { FilterRequest, ApiResponse } from '@/types/api';

export interface LeaveRequestWithDetails extends LeaveRequest {
  employee_name?: string;
  employee_email?: string;
  department_name?: string;
  designation_name?: string;
  leave_type_name?: string;
  leave_type_code?: string;
  leave_type_color?: string;
  leave_type_icon?: string;
}

export interface LeaveRequestFilters extends FilterRequest {
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'all';
  leave_type?: string;
  employee_id?: string;
  department?: string;
  date_from?: string;
  date_to?: string;
  month?: number;
  year?: number;
  is_half_day?: boolean;
  search?: string;
}

export interface LeaveStatistics {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  cancelled_requests: number;
  total_days_requested: number;
  average_processing_time: number;
  leave_type_distribution: {
    [key: string]: number;
  };
  department_distribution: {
    [key: string]: number;
  };
}

class LeaveService {
  // Leave Types
  async getLeaveTypes(filters: FilterRequest = { page: 1, page_size: 100 }): Promise<ApiResponse<Leave[]>> {
    return apiClient.post<Leave[]>(API_ENDPOINTS.LEAVES_LIST, filters);
  }

  async createLeaveType(data: InsertLeave): Promise<ApiResponse<Leave>> {
    return apiClient.post<Leave>(API_ENDPOINTS.LEAVES_CREATE, data);
  }

  async updateLeaveType(data: Partial<Leave> & { id: string }): Promise<ApiResponse<Leave>> {
    return apiClient.put<Leave>(API_ENDPOINTS.LEAVES_UPDATE, data);
  }

  async deleteLeaveType(id: string): Promise<ApiResponse<void>> {
    return apiClient.patch<void>(API_ENDPOINTS.LEAVES_DELETE, { id });
  }

  // Leave Requests
  async getLeaveRequests(filters: LeaveRequestFilters = { page: 1, page_size: 50 }): Promise<ApiResponse<LeaveRequestWithDetails[]>> {
    return apiClient.post<LeaveRequestWithDetails[]>(API_ENDPOINTS.LEAVE_REQUESTS_LIST, filters);
  }

  async getLeaveRequest(id: string): Promise<ApiResponse<LeaveRequestWithDetails>> {
    return apiClient.post<LeaveRequestWithDetails>(API_ENDPOINTS.LEAVE_REQUESTS_ONE, { 
      id,
      include: ["leave", "employee"]
    });
  }

  async createLeaveRequest(data: InsertLeaveRequest): Promise<ApiResponse<LeaveRequest>> {
    return apiClient.post<LeaveRequest>(API_ENDPOINTS.LEAVE_REQUESTS_CREATE, data);
  }

  async updateLeaveRequest(data: Partial<LeaveRequest> & { id: string }): Promise<ApiResponse<LeaveRequest>> {
    return apiClient.put<LeaveRequest>(API_ENDPOINTS.LEAVE_REQUESTS_UPDATE, data);
  }

  async deleteLeaveRequest(id: string): Promise<ApiResponse<void>> {
    return apiClient.patch<void>(API_ENDPOINTS.LEAVE_REQUESTS_DELETE, { id });
  }

  // Leave Statistics
  async getLeaveStatistics(filters: Partial<LeaveRequestFilters> = {}): Promise<ApiResponse<LeaveStatistics>> {
    return apiClient.post<LeaveStatistics>(API_ENDPOINTS.LEAVE_REQUESTS_STATISTICS, filters);
  }

  // Approve Leave Request
  async approveLeaveRequest(id: string, approverComments?: string): Promise<ApiResponse<LeaveRequest>> {
    return apiClient.put<LeaveRequest>(API_ENDPOINTS.LEAVE_REQUESTS_UPDATE, {
      id,
      status: 'APPROVED',
      approver_comments: approverComments,
      approved_at: new Date().toISOString()
    });
  }

  // Reject Leave Request
  async rejectLeaveRequest(id: string, approverComments?: string): Promise<ApiResponse<LeaveRequest>> {
    return apiClient.put<LeaveRequest>(API_ENDPOINTS.LEAVE_REQUESTS_UPDATE, {
      id,
      status: 'REJECTED',
      approver_comments: approverComments,
      rejected_at: new Date().toISOString()
    });
  }

  // Note: Employee Leave Balance, Bulk Operations, and Export endpoints 
  // are not currently implemented in the backend
  // These methods can be added when the backend endpoints are available
}

export const leaveService = new LeaveService();