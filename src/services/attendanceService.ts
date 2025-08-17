import { apiClient } from '@/lib/api';
import { API_ENDPOINTS } from './api/endpoints';
import { ApiResponse } from '@/types/api';

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  department: string;
  designation: string;
  date: string;
  status: 'present' | 'absent' | 'half-day' | 'on-leave' | 'weekend';
  check_in_time?: string;
  check_out_time?: string;
  total_hours?: number;
  late_minutes?: number;
  early_departure?: number;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceListRequest {
  page?: number;
  page_size?: number;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  search?: string;
  department?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  month?: number;
  year?: number;
}

export interface AttendanceStats {
  total_employees: number;
  present_today: number;
  absent_today: number;
  half_day_today: number;
  on_leave_today: number;
  attendance_rate: number;
  previous_month_rate: number;
}

class AttendanceService {
  async getAttendanceList(params: AttendanceListRequest = {}): Promise<ApiResponse<AttendanceRecord[]>> {
    return apiClient.post(API_ENDPOINTS.ATTENDANCE_LIST, params);
  }

  async getAttendanceStats(month?: number, year?: number): Promise<ApiResponse<AttendanceStats>> {
    const params: any = {};
    if (month !== undefined) params.month = month;
    if (year !== undefined) params.year = year;
    
    return apiClient.post('/dashboard/attendance-stats', params);
  }

  async getEmployeeAttendance(employeeId: string, params: AttendanceListRequest = {}): Promise<ApiResponse<AttendanceRecord[]>> {
    return apiClient.post(`${API_ENDPOINTS.ATTENDANCE_LIST}`, {
      ...params,
      employee_id: employeeId
    });
  }

  async createAttendance(data: Partial<AttendanceRecord>): Promise<ApiResponse<AttendanceRecord>> {
    return apiClient.post(API_ENDPOINTS.ATTENDANCE_CREATE, data);
  }

  async updateAttendance(id: string, data: Partial<AttendanceRecord>): Promise<ApiResponse<AttendanceRecord>> {
    return apiClient.put(API_ENDPOINTS.ATTENDANCE_UPDATE, {
      id,
      ...data
    });
  }

  async deleteAttendance(id: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete(API_ENDPOINTS.ATTENDANCE_DELETE, {
      id
    });
  }
}

export const attendanceService = new AttendanceService();
