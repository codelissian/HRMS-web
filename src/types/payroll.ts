export interface Employee {
  id: string;
  name: string;
  code: string;
  mobile: string;
  email: string;
  organisation_id: string;
  department_id: string;
  designation_id: string;
  attendance_rule_id: string | null;
  included_in_payroll: boolean;
  shift_id: string | null;
  role_id: string | null;
  date_of_birth: string;
  address: string;
  gender: string | null;
  emergency_contact: string;
  pan_number: string;
  joining_date: string;
  image: string | null;
  username: string | null;
  alternate_mobile: string | null;
  documents: any[];
  city: string | null;
  state: string | null;
  country: string | null;
  pin_code: string | null;
  adhaar_number: string | null;
  driving_license_number: string | null;
  bank_details: any | null;
  ctc: number;
  basic_salary: number;
  effective_from: string;
  effective_to: string | null;
  is_opt_for_bonus: boolean;
  bonus_type: string | null;
  bonus_calculation: string | null;
  bonus_value: number | null;
  bonus_formula: string | null;
  bonus_min_tenure: number | null;
  active_flag: boolean;
  delete_flag: boolean;
  modified_at: string;
  created_at: string;
  created_by: string | null;
  modified_by: string | null;
}

export interface Payroll {
  id: string;
  organisation_id: string;
  employee_id: string;
  payroll_cycle_id: string;
  status: 'DRAFT' | 'PROCESSING' | 'PAID' | 'CANCELLED' | 'CALCULATED';
  working_days: number;
  present_days: number;
  absent_days: number;
  leave_days: number;
  paid_leave_days: number;
  unpaid_leave_days: number;
  overtime_hours: number;
  net_salary: number;
  gross_salary: number;
  basic_salary: number;
  total_allowances: number;
  total_deductions: number;
  total_statutory: number;
  pf_employee: number;
  pf_employer: number;
  esi: number;
  professional_tax: number;
  income_tax: number;
  tds: number;
  remarks: string;
  active_flag: boolean;
  delete_flag: boolean;
  modified_at: string;
  created_at: string;
  created_by: string | null;
  modified_by: string | null;
  employee: Employee;
}

export interface CreatePayrollData {
  employee_id: string;
  payroll_cycle_id: string;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  status?: 'DRAFT' | 'PROCESSING' | 'PAID' | 'CANCELLED';
  payment_date?: string;
  payment_method?: string;
  active_flag?: boolean;
}

export interface UpdatePayrollData {
  id: string;
  employee_id: string;
  payroll_cycle_id: string;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  status: 'DRAFT' | 'PROCESSING' | 'PAID' | 'CANCELLED';
  payment_date?: string;
  payment_method?: string;
  active_flag: boolean;
}

export interface PayrollsResponse {
  status: boolean;
  message: string;
  data: Payroll[];
  total_count: number;
  page_count: number;
  page_size: number;
  page: number;
}