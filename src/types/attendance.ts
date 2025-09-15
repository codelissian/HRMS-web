export interface AttendancePolicy {
  id: string;
  organisation_id: string;
  name: string;
  geo_tracking_enabled: boolean;
  geo_radius_meters: number;
  latitude?: string;
  longitude?: string;
  selfie_required: boolean;
  web_attendance_enabled: boolean;
  mobile_attendance_enabled: boolean;
  regularization_enabled: boolean;
  grace_period_minutes?: number;
  overtime_threshold_hours?: number;
  break_management_enabled?: boolean;
  active_flag?: boolean;
  delete_flag?: boolean;
  created_at?: string;
  modified_at?: string;
  created_by?: string | null;
  modified_by?: string | null;
}

export interface CreateAttendancePolicyRequest {
  name: string;
  organisation_id: string;
  geo_tracking_enabled: boolean;
  geo_radius_meters: number;
  latitude?: string;
  longitude?: string;
  selfie_required: boolean;
  web_attendance_enabled: boolean;
  mobile_attendance_enabled: boolean;
  regularization_enabled: boolean;
}

export interface UpdateAttendancePolicyRequest extends CreateAttendancePolicyRequest {
  id: string;
}

export interface ListAttendancePoliciesRequest {
  page: number;
  page_size: number;
  search?: string;
}

export interface AttendancePoliciesResponse {
  data: AttendancePolicy[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AttendancePolicyFormData {
  name: string;
  geo_tracking_enabled: boolean;
  geo_radius_meters: number;
  latitude?: string;
  longitude?: string;
  selfie_required: boolean;
  web_attendance_enabled: boolean;
  mobile_attendance_enabled: boolean;
  regularization_enabled: boolean;
}

