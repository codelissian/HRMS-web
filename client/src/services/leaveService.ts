import { apiClient } from '@/lib/api';
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
  async getLeaveRequests(filters: LeaveRequestFilters = {}): Promise<ApiResponse<LeaveRequestWithDetails[]>> {
    return apiClient.post<LeaveRequestWithDetails[]>('/leave-requests/list', filters);
  }

  async getLeaveRequest(id: string): Promise<ApiResponse<LeaveRequestWithDetails>> {
    return apiClient.post<LeaveRequestWithDetails>('/leave-requests/one', { id });
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

  // Leave Statistics
  async getLeaveStatistics(filters: Partial<LeaveRequestFilters> = {}): Promise<ApiResponse<LeaveStatistics>> {
    return apiClient.post<LeaveStatistics>('/leave-requests/statistics', filters);
  }

  // Employee Leave Balance
  async getEmployeeLeaveBalance(employeeId: string): Promise<ApiResponse<any>> {
    return apiClient.post('/leave-requests/employee-balance', { employee_id: employeeId });
  }

  // Bulk Operations
  async bulkApproveRequests(requestIds: string[], approverComments?: string): Promise<ApiResponse<boolean>> {
    return apiClient.put('/leave-requests/bulk-approve', {
      request_ids: requestIds,
      approver_comments: approverComments
    });
  }

  async bulkRejectRequests(requestIds: string[], rejectReason: string): Promise<ApiResponse<boolean>> {
    return apiClient.put('/leave-requests/bulk-reject', {
      request_ids: requestIds,
      reject_reason: rejectReason
    });
  }

  // Export
  async exportLeaveRequests(filters: LeaveRequestFilters = {}): Promise<ApiResponse<string>> {
    return apiClient.post('/leave-requests/export', filters);
  }
}

export const leaveService = new LeaveService();