import { httpClient } from '@/lib/httpClient';
import { API_ENDPOINTS } from './api/endpoints';
import { ApiResponse } from '@/types/api';

// Raw API response structure
export interface AttendanceEvent {
  id: string;
  employee_id: string;
  organisation_id: string;
  event_type: 'CLOCK_IN' | 'CLOCK_OUT';
  event_time: string;
  event_location: {
    latitude: string;
    longitude: string;
    place_name: string;
  };
  event_selfie: string | null;
  active_flag: boolean;
  delete_flag: boolean;
  modified_at: string;
  created_at: string;
  created_by: string | null;
  modified_by: string | null;
}

// Processed attendance record for UI display
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
    name?: 'asc' | 'desc';
    event_time?: 'asc' | 'desc';
    employee_id?: 'asc' | 'desc';
  };
  filter_type?: 'AND' | 'OR';
  organisation_id?: string;
  active_flag?: boolean;
  include?: string[];
  // Additional filters that might be supported
  employee_id?: string;
  event_type?: 'CLOCK_IN' | 'CLOCK_OUT';
  date_from?: string;
  date_to?: string;
  search?: string;
  department?: string;
  status?: string;
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

// Today's Attendance API types
export interface TodaysAttendanceRequest {
  shift_id?: string;
  organisation_id?: string;
  date: string; // ISO date string
  page?: number;
  page_size?: number;
  include?: string[]; // Array of relations to include (e.g., ["department"])
  search?: {
    keys: string[];
    value: string;
  };
}

export interface TodaysAttendanceRecord {
  id: string;
  name: string;
  organisation_id: string;
  mobile: string;
  email: string;
  code: string;
  department_id: string;
  designation_id: string;
  shift_id: string;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'ON_LEAVE' | 'WEEKEND';
  attendance_records: AttendanceEvent[];
  // Direct fields from API (if available)
  check_in_time?: string;
  check_out_time?: string;
  is_late?: boolean;
  is_early?: boolean;
  // Include other employee fields as needed
  [key: string]: any;
}

// Today's Attendance Statistics API types
export interface TodayAttendanceStatisticsRequest {
  shift_id: string;
  organisation_id: string;
}

export interface TodayAttendanceStatistics {
  total_employees: number;
  present: number;
  absent: number;
  on_leave: number;
  half_day: number;
}

class AttendanceService {
  // Transform raw events into attendance records for UI display
  private transformEventsToRecords(events: AttendanceEvent[]): AttendanceRecord[] {
    // Group events by employee and date
    const groupedEvents = events.reduce((acc, event) => {
      const date = new Date(event.event_time).toISOString().split('T')[0];
      const key = `${event.employee_id}-${date}`;
      
      if (!acc[key]) {
        acc[key] = {
          employee_id: event.employee_id,
          date: date,
          events: []
        };
      }
      acc[key].events.push(event);
      return acc;
    }, {} as Record<string, { employee_id: string; date: string; events: AttendanceEvent[] }>);

    // Convert grouped events to records
    return Object.values(groupedEvents).map(group => {
      const clockInEvents = group.events.filter(e => e.event_type === 'CLOCK_IN');
      const clockOutEvents = group.events.filter(e => e.event_type === 'CLOCK_OUT');
      
      const checkInTime = clockInEvents.length > 0 ? clockInEvents[0].event_time : undefined;
      const checkOutTime = clockOutEvents.length > 0 ? clockOutEvents[0].event_time : undefined;
      
      // Calculate total hours if both times exist
      let totalHours = 0;
      if (checkInTime && checkOutTime) {
        const checkIn = new Date(checkInTime);
        const checkOut = new Date(checkOutTime);
        totalHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
      }
      
      // Determine status based on events
      let status: 'present' | 'absent' | 'half-day' | 'on-leave' | 'weekend' = 'absent';
      if (clockInEvents.length > 0) {
        status = 'present';
        if (totalHours > 0 && totalHours < 4) {
          status = 'half-day';
        }
      }
      
      // Try to extract employee info from the first event (if included in API response)
      const firstEvent = group.events[0];
      
      console.log('🔍 First event for debugging:', firstEvent);
      console.log('🔍 Employee object:', (firstEvent as any).employee);
      
      const employeeName = (firstEvent as any).employee?.name || 
                          ((firstEvent as any).employee?.first_name && (firstEvent as any).employee?.last_name ? 
                            `${(firstEvent as any).employee.first_name} ${(firstEvent as any).employee.last_name}` : null) ||
                          (firstEvent as any).employee_name || 
                          `Employee ${group.employee_id.slice(0, 8)}`;
      
      const department = (firstEvent as any).employee?.department?.name || 
                        (firstEvent as any).employee?.department_name ||
                        (firstEvent as any).employee?.department ||
                        (firstEvent as any).department || 
                        'Unknown';
      
      const designation = (firstEvent as any).employee?.designation?.name || 
                         (firstEvent as any).employee?.designation_name ||
                         (firstEvent as any).employee?.designation ||
                         (firstEvent as any).designation || 
                         'Unknown';
      
      const avatar = (firstEvent as any).employee?.avatar || 
                    (firstEvent as any).employee?.photo ||
                    undefined;
      
      console.log('🔍 Extracted data:', { employeeName, department, designation });
      
      return {
        id: group.events[0].id, // Use first event ID as record ID
        employee_id: group.employee_id,
        employee_name: employeeName,
        department: department,
        designation: designation,
        date: group.date,
        status: status,
        check_in_time: checkInTime ? new Date(checkInTime).toLocaleTimeString() : undefined,
        check_out_time: checkOutTime ? new Date(checkOutTime).toLocaleTimeString() : undefined,
        total_hours: totalHours > 0 ? Math.round(totalHours * 100) / 100 : undefined,
        late_minutes: 0, // Placeholder - should be calculated based on expected start time
        early_departure: 0, // Placeholder - should be calculated based on expected end time
        avatar: avatar,
        created_at: group.events[0].created_at,
        updated_at: group.events[0].modified_at
      };
    });
  }
  async getAttendanceList(params: AttendanceListRequest = {}): Promise<ApiResponse<AttendanceRecord[]>> {
    // Send include parameter to get employee object
    const requestPayload = {
      include: ["employee"]
    };

    console.log('📡 Attendance API Request:', requestPayload);
    
    const response = await httpClient.post<ApiResponse<AttendanceEvent[]>>(API_ENDPOINTS.ATTENDANCE_LIST, requestPayload);
    
    console.log('📡 Attendance API Response:', response.data);
    console.log('📡 Raw events data:', response.data.data);
    
    // Transform events into records for UI display
    const events = response.data.data || [];
    console.log('📡 Events count:', events.length);
    if (events.length > 0) {
      console.log('📡 First event structure:', events[0]);
    }
    const records = this.transformEventsToRecords(events);
    
    return {
      ...response.data,
      data: records
    };
  }

  async getAttendanceStats(month?: number, year?: number): Promise<ApiResponse<AttendanceStats>> {
    const response = await httpClient.post<ApiResponse<AttendanceStats>>('/dashboard/attendance-stats', {});
    return response.data;
  }

  async getEmployeeAttendance(employeeId: string, params: AttendanceListRequest = {}): Promise<ApiResponse<AttendanceRecord[]>> {
    const response = await httpClient.post<ApiResponse<AttendanceEvent[]>>(API_ENDPOINTS.ATTENDANCE_LIST, {
      include: ["employee"]
    });
    
    // Transform events into records for UI display
    const events = response.data.data || [];
    const records = this.transformEventsToRecords(events);
    
    return {
      ...response.data,
      data: records
    };
  }

  async createAttendance(data: Partial<AttendanceRecord>): Promise<ApiResponse<AttendanceEvent>> {
    const response = await httpClient.post<ApiResponse<AttendanceEvent>>(API_ENDPOINTS.ATTENDANCE_CREATE, data);
    return response.data;
  }

  async updateAttendance(id: string, data: Partial<AttendanceRecord>): Promise<ApiResponse<AttendanceEvent>> {
    const response = await httpClient.put<ApiResponse<AttendanceEvent>>(API_ENDPOINTS.ATTENDANCE_UPDATE, {
      id,
      ...data
    });
    return response.data;
  }

  async deleteAttendance(id: string): Promise<ApiResponse<boolean>> {
    const response = await httpClient.patch<ApiResponse<boolean>>(API_ENDPOINTS.ATTENDANCE_DELETE, {});
    return response.data;
  }

  async getTodaysAttendance(params: TodaysAttendanceRequest, organisationId?: string): Promise<ApiResponse<TodaysAttendanceRecord[]>> {
    // Build query string for organisation parameter
    const queryParams = organisationId ? `?organisation=${organisationId}` : '';
    const url = `${API_ENDPOINTS.ATTENDANCE_DAY}${queryParams}`;
    
    const response = await httpClient.post<ApiResponse<TodaysAttendanceRecord[]>>(url, params);
    return response.data;
  }

  async getTodayAttendanceStatistics(params: TodayAttendanceStatisticsRequest): Promise<ApiResponse<TodayAttendanceStatistics>> {
    const response = await httpClient.post<ApiResponse<TodayAttendanceStatistics>>(API_ENDPOINTS.ATTENDANCE_STATISTICS, params);
    return response.data;
  }
}

export const attendanceService = new AttendanceService();
