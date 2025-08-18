import { httpClient } from '@/lib/httpClient';
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
    const response = await httpClient.post<ApiResponse<AttendanceRecord[]>>(API_ENDPOINTS.ATTENDANCE_LIST, {});
    return response.data;
  }

  async getAttendanceStats(month?: number, year?: number): Promise<ApiResponse<AttendanceStats>> {
    const response = await httpClient.post<ApiResponse<AttendanceStats>>('/dashboard/attendance-stats', {});
    return response.data;
  }

  async getEmployeeAttendance(employeeId: string, params: AttendanceListRequest = {}): Promise<ApiResponse<AttendanceRecord[]>> {
    const response = await httpClient.post<ApiResponse<AttendanceRecord[]>>(API_ENDPOINTS.ATTENDANCE_LIST, {});
    return response.data;
  }

  async createAttendance(data: Partial<AttendanceRecord>): Promise<ApiResponse<AttendanceRecord>> {
    const response = await httpClient.post<ApiResponse<AttendanceRecord>>(API_ENDPOINTS.ATTENDANCE_CREATE, {});
    return response.data;
  }

  async updateAttendance(id: string, data: Partial<AttendanceRecord>): Promise<ApiResponse<AttendanceRecord>> {
    const response = await httpClient.put<ApiResponse<AttendanceRecord>>(API_ENDPOINTS.ATTENDANCE_UPDATE, {});
    return response.data;
  }

  async deleteAttendance(id: string): Promise<ApiResponse<boolean>> {
    const response = await httpClient.patch<ApiResponse<boolean>>(API_ENDPOINTS.ATTENDANCE_DELETE, {});
    return response.data;
  }
}

export const attendanceService = new AttendanceService();
