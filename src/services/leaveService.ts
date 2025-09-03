import { httpClient } from '@/lib/httpClient';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import { LeaveRequest, Leave } from '../types/database';
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
    try {
      const response = await httpClient.post<any>(API_ENDPOINTS.LEAVES_LIST, filters);
      
      // Extract the actual data from the nested response structure
      const apiResponse: ApiResponse<Leave[]> = {
        status: response.data.status,
        data: response.data.data || [],
        message: response.data.message || 'Success',
        total_count: response.data.total_count,
        page: response.data.page,
        page_count: response.data.page_count,
        page_size: response.data.page_size
      };
      
      return apiResponse;
    } catch (error) {
      console.error('Error fetching leave types:', error);
      throw error;
    }
  }

  async createLeaveType(data: Partial<Leave>): Promise<ApiResponse<Leave>> {
    return httpClient.post<Leave>(API_ENDPOINTS.LEAVES_CREATE, data);
  }

  async updateLeaveType(data: Partial<Leave> & { id: string }): Promise<ApiResponse<Leave>> {
    return httpClient.put<Leave>(API_ENDPOINTS.LEAVES_UPDATE, data);
  }

  async deleteLeaveType(id: string): Promise<ApiResponse<void>> {
    return httpClient.patch<void>(API_ENDPOINTS.LEAVES_DELETE, { id });
  }

  // Leave Requests
  async getLeaveRequests(filters: LeaveRequestFilters = { page: 1, page_size: 50 }): Promise<ApiResponse<LeaveRequestWithDetails[]>> {
    try {
      const response = await httpClient.post<any>(API_ENDPOINTS.LEAVE_REQUESTS_LIST, filters);
      
      // Extract the actual data from the nested response structure
      const apiResponse: ApiResponse<LeaveRequestWithDetails[]> = {
        status: response.data.status,
        data: response.data.data || [],
        message: response.data.message || 'Success',
        total_count: response.data.total_count,
        page: response.data.page,
        page_count: response.data.page_count,
        page_size: response.data.page_size
      };
      
      return apiResponse;
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      throw error;
    }
  }

  async getLeaveRequest(id: string): Promise<ApiResponse<LeaveRequestWithDetails>> {
    try {
      const response = await httpClient.post<any>(API_ENDPOINTS.LEAVE_REQUESTS_ONE, { 
        id,
        include: ["leave", "employee"]
      });
      
      // Extract the actual data from the nested response structure
      const apiResponse: ApiResponse<LeaveRequestWithDetails> = {
        status: response.data.status,
        data: response.data.data,
        message: response.data.message || 'Success',
        total_count: response.data.total_count,
        page: response.data.page,
        page_count: response.data.page_count,
        page_size: response.data.page_size
      };
      
      return apiResponse;
    } catch (error) {
      console.error('Error fetching leave request:', error);
      throw error;
    }
  }

  async createLeaveRequest(data: InsertLeaveRequest): Promise<ApiResponse<LeaveRequest>> {
    return httpClient.post<LeaveRequest>(API_ENDPOINTS.LEAVE_REQUESTS_CREATE, data);
  }

  async updateLeaveRequest(data: Partial<LeaveRequest> & { id: string }): Promise<ApiResponse<LeaveRequest>> {
    return httpClient.put<LeaveRequest>(API_ENDPOINTS.LEAVE_REQUESTS_UPDATE, data);
  }

  async deleteLeaveRequest(id: string): Promise<ApiResponse<void>> {
    return httpClient.patch<void>(API_ENDPOINTS.LEAVE_REQUESTS_DELETE, { id });
  }

  // Leave Statistics
  async getLeaveStatistics(filters: Partial<LeaveRequestFilters> = {}): Promise<ApiResponse<LeaveStatistics>> {
    try {
      const response = await httpClient.post<any>(API_ENDPOINTS.LEAVE_REQUESTS_STATISTICS, filters);
      
      // Extract the actual data from the nested response structure
      const apiResponse: ApiResponse<LeaveStatistics> = {
        status: response.data.status,
        data: response.data.data,
        message: response.data.message || 'Success',
        total_count: response.data.total_count,
        page: response.data.page,
        page_count: response.data.page_count,
        page_size: response.data.page_size
      };
      
      return apiResponse;
    } catch (error) {
      console.error('Error fetching leave statistics:', error);
      throw error;
    }
  }

  // Approve Leave Request
  async approveLeaveRequest(id: string, approverComments?: string): Promise<ApiResponse<LeaveRequest>> {
    try {
      const response = await httpClient.put<any>(`${API_ENDPOINTS.LEAVE_REQUESTS_UPDATE}_status`, {
        id,
        status: 'APPROVED'
      });
      
      // Extract the actual data from the nested response structure
      const apiResponse: ApiResponse<LeaveRequest> = {
        status: response.data.status,
        data: response.data.data,
        message: response.data.message || 'Leave request approved successfully',
        total_count: response.data.total_count,
        page: response.data.page,
        page_count: response.data.page_count,
        page_size: response.data.page_size
      };
      
      return apiResponse;
    } catch (error) {
      console.error('Error approving leave request:', error);
      throw error;
    }
  }

  // Reject Leave Request
  async rejectLeaveRequest(id: string, approverComments?: string): Promise<ApiResponse<LeaveRequest>> {
    try {
      const response = await httpClient.put<any>(`${API_ENDPOINTS.LEAVE_REQUESTS_UPDATE}_status`, {
        id,
        status: 'REJECTED'
      });
      
      // Extract the actual data from the nested response structure
      const apiResponse: ApiResponse<LeaveRequest> = {
        status: response.data.status,
        data: response.data.data,
        message: response.data.message || 'Leave request rejected successfully',
        total_count: response.data.total_count,
        page: response.data.page,
        page_count: response.data.page_count,
        page_size: response.data.page_size
      };
      
      return apiResponse;
    } catch (error) {
      console.error('Error rejecting leave request:', error);
      throw error;
    }
  }

  // Note: Employee Leave Balance, Bulk Operations, and Export endpoints 
  // are not currently implemented in the backend
  // These methods can be added when the backend endpoints are available
}

export const leaveService = new LeaveService();