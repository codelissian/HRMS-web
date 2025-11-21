export interface PayrollCycle {
  id: string;
  name: string;
  pay_period_start: string;
  pay_period_end: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAID' | 'CANCELLED';
  salary_month: number;
  salary_year: number;
  working_days: number;
  organisation_id: string;
  active_flag: boolean;
  delete_flag: boolean;
  amount?: number;
  modified_at: string;
  created_at: string;
  created_by: string | null;
  modified_by: string | null;
}

export interface CreatePayrollCycleData {
  name: string;
  pay_period_start: string;
  pay_period_end: string;
  status?: 'DRAFT' | 'ACTIVE' | 'PAID' | 'CANCELLED';
  salary_month: number;
  salary_year: number;
  working_days: number;
  active_flag?: boolean;
}

export interface UpdatePayrollCycleData {
  id: string;
  name: string;
  pay_period_start: string;
  pay_period_end: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAID' | 'CANCELLED';
  salary_month: number;
  salary_year: number;
  working_days: number;
  active_flag: boolean;
}

export interface PayrollCyclesResponse {
  status: boolean;
  message: string;
  data: PayrollCycle[];
  total_count: number;
  page_count: number;
  page_size: number;
  page: number;
}

export interface PayrollCycleWithRelations extends PayrollCycle {
  organisation?: {
    id: string;
    name: string;
    code?: string | null;
    [key: string]: any;
  };
}