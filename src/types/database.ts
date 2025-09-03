// Database entity types for frontend use
// These should match the backend API response structure

export interface Admin {
  id: string;
  full_name?: string;
  mobile?: string;
  email?: string;
  password?: string;
  image?: string;
  username?: string;
  alternate_mobile?: string;
  address?: string;
  documents?: string[];
  city?: string;
  state?: string;
  country?: string;
  pin_code?: string;
  adhaar_number?: string;
  driving_license_number?: string;
  active_flag?: boolean;
  delete_flag?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Organisation {
  id: string;
  admin_id?: string;
  name: string;
  plan?: string;
  active_modules?: string[];
  active_flag?: boolean;
  delete_flag?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Employee {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  password?: string;
  included_in_payroll?: boolean;
  date_of_birth?: string;
  address?: string;
  pan_number?: string;
  status?: string;
  joining_date?: string;
  organisation_id?: string;
  department_id?: string;
  designation_id?: string;
  shift_id?: string;
  bank_details?: any;
  role_id?: string;
  active_flag?: boolean;
  delete_flag?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  organisation_id: string;
  active_flag?: boolean;
  delete_flag?: boolean;
  created_at?: string;
  modified_at?: string;
  created_by?: string;
  modified_by?: string;
}

export interface Designation {
  id: string;
  name: string;
  organisation_id: string;
  active_flag?: boolean;
  delete_flag?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Shift {
  id: string;
  name: string;
  start: string;
  end: string;
  grace_minutes?: number;
  organisation_id: string;
  active_flag?: boolean;
  delete_flag?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Leave {
  id: string;
  name: string;
  code: string;
  description?: string;
  color?: string;
  icon?: string;
  organisation_id: string;
  category?: string;
  accrual_method?: string;
  accrual_rate?: number;
  initial_balance?: number;
  max_balance?: number;
  min_balance?: number;
  allow_carry_forward?: boolean;
  carry_forward_limit?: number;
  carry_forward_expiry_months?: number;
  allow_encashment?: boolean;
  encashment_rate?: number;
  requires_approval?: boolean;
  requires_documentation?: boolean;
  required_documents?: any;
  auto_approve_for_days?: number;
  approval_levels?: string;
  min_service_months?: number;
  min_advance_notice_days?: number;
  max_consecutive_days?: number;
  blackout_dates?: any;
  active_flag?: boolean;
  delete_flag?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_id: string;
  organisation_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason?: string;
  comments?: string;
  status?: string;
  is_half_day?: boolean;
  work_handover_to?: string;
  handover_notes?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  approver_comments?: string;
  approved_at?: string;
  rejected_at?: string;
  attachments?: any[];
  approvals?: any[];
  active_flag?: boolean;
  delete_flag?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  organisation_id?: string;
  active_flag?: boolean;
  delete_flag?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Permission {
  id: string;
  resource: string;
  actions: string[];
  description?: string;
  organisation_id?: string;
  active_flag?: boolean;
  delete_flag?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Extended types for employees with included relations
export interface EmployeeWithDepartment extends Employee {
  department?: Department;
}

export interface EmployeeWithDesignation extends Employee {
  designation?: Designation;
}

export interface EmployeeWithRelations extends Employee {
  department?: Department;
  designation?: Designation;
  shift?: Shift;
  employee_leaves?: Array<{
    id: string;
    employee_id: string;
    leave_id: string;
    balance: number;
    last_accrual_date: string | null;
    next_accrual_date: string | null;
    total_accrued: number;
    total_consumed: number;
    active_flag: boolean | null;
    delete_flag: boolean | null;
    modified_at: string | null;
    created_at: string | null;
    created_by: string | null;
    modified_by: string | null;
    leave: Leave;
  }>;
}