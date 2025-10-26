export interface WorkDayRule {
  id: string;
  organisation_id: string;
  name: string;
  workweek: 'five_days' | 'six_days' | 'seven_days';
  monday: boolean;
  include_monday_in_pattern: boolean;
  include_monday_in_payroll: boolean;
  monday_pattern: string;
  tuesday: boolean;
  include_tuesday_in_pattern: boolean;
  include_tuesday_in_payroll: boolean;
  tuesday_pattern: string;
  wednesday: boolean;
  include_wednesday_in_pattern: boolean;
  include_wednesday_in_payroll: boolean;
  wednesday_pattern: string;
  thursday: boolean;
  include_thursday_in_pattern: boolean;
  include_thursday_in_payroll: boolean;
  thursday_pattern: string;
  friday: boolean;
  include_friday_in_pattern: boolean;
  include_friday_in_payroll: boolean;
  friday_pattern: string;
  saturday: boolean;
  include_saturday_in_pattern: boolean;
  include_saturday_in_payroll: boolean;
  saturday_pattern: string;
  sunday: boolean;
  include_sunday_in_pattern: boolean;
  include_sunday_in_payroll: boolean;
  sunday_pattern: string;
  active_flag: boolean;
  delete_flag: boolean;
  created_at?: string;
  updated_at?: string;
  modified_at?: string;
  created_by?: string | null;
  modified_by?: string | null;
}

export interface WorkDayRuleListResponse {
  data: WorkDayRule[];
  total_count: number;
  page_count: number;
  current_page: number;
  page_size: number;
}

export interface WorkDayRuleListParams {
  page?: number;
  page_size?: number;
  search?: string;
}

export interface WorkDayRuleFormData {
  name: string;
  workweek: 'five_days' | 'six_days' | 'seven_days';
  include_monday_in_payroll: boolean;
  include_tuesday_in_payroll: boolean;
  include_wednesday_in_payroll: boolean;
  include_thursday_in_payroll: boolean;
  include_friday_in_payroll: boolean;
  include_saturday_in_payroll: boolean;
  include_sunday_in_payroll: boolean;
  // Fields that will be automatically set by the form logic before API submission
  monday?: boolean;
  tuesday?: boolean;
  wednesday?: boolean;
  thursday?: boolean;
  friday?: boolean;
  saturday?: boolean;
  sunday?: boolean;
  include_monday_in_pattern?: boolean;
  monday_pattern?: string;
  include_tuesday_in_pattern?: boolean;
  tuesday_pattern?: string;
  include_wednesday_in_pattern?: boolean;
  wednesday_pattern?: string;
  include_thursday_in_pattern?: boolean;
  thursday_pattern?: string;
  include_friday_in_pattern?: boolean;
  friday_pattern?: string;
  include_saturday_in_pattern?: boolean;
  saturday_pattern?: string;
  include_sunday_in_pattern?: boolean;
  sunday_pattern?: string;
  active_flag?: boolean;
  delete_flag?: boolean;
}