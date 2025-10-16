import { httpClient } from './httpClient';
import { API_ENDPOINTS } from './api/endpoints';
import { 
  Payroll, 
  CreatePayrollData, 
  UpdatePayrollData, 
  PayrollsResponse 
} from '@/types/payroll';

export class PayrollService {
  static async createPayroll(payrollData: CreatePayrollData): Promise<Payroll> {
    const response = await httpClient.post(API_ENDPOINTS.PAYROLLS_CREATE, payrollData);
    if (response.data.status && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Creation failed');
    }
  }

  static async getPayrolls(): Promise<PayrollsResponse> {
    const response = await httpClient.post(API_ENDPOINTS.PAYROLLS_LIST, {
      include: ["employee"]
    });
    return response.data;
  }

  static async getPayrollsByCycle(payrollCycleId: string): Promise<PayrollsResponse> {
    const response = await httpClient.post(API_ENDPOINTS.PAYROLLS_LIST, {
      payroll_cycle_id: payrollCycleId,
      include: ["employee"]
    });
    return response.data;
  }

  static async getPayroll(id: string): Promise<Payroll> {
    const response = await httpClient.post(API_ENDPOINTS.PAYROLLS_ONE, { id });
    if (response.data.status && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Fetch failed');
    }
  }

  static async updatePayroll(id: string, payrollData: Partial<CreatePayrollData> & { active_flag?: boolean }): Promise<Payroll> {
    const updatePayload = {
      id,
      employee_id: payrollData.employee_id || '',
      payroll_cycle_id: payrollData.payroll_cycle_id || '',
      basic_salary: payrollData.basic_salary || 0,
      allowances: payrollData.allowances || 0,
      deductions: payrollData.deductions || 0,
      net_salary: payrollData.net_salary || 0,
      status: payrollData.status || 'DRAFT',
      payment_date: payrollData.payment_date || '',
      payment_method: payrollData.payment_method || '',
      active_flag: payrollData.active_flag !== undefined ? payrollData.active_flag : true
    };
    
    try {
      const response = await httpClient.put(API_ENDPOINTS.PAYROLLS_UPDATE, updatePayload);
      
      if (response.data.status && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error: any) {
      console.error('Error updating payroll:', error);
      throw error;
    }
  }

  static async deletePayroll(id: string): Promise<void> {
    await httpClient.patch(API_ENDPOINTS.PAYROLLS_DELETE, { id });
  }

  static async updatePayrollStatus(id: string, status: 'DRAFT' | 'PROCESSING' | 'PAID' | 'CANCELLED'): Promise<Payroll> {
    const updatePayload = {
      id,
      status
    };
    
    try {
      const response = await httpClient.put(API_ENDPOINTS.PAYROLLS_UPDATE, updatePayload);
      
      if (response.data.status && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Status update failed');
      }
    } catch (error: any) {
      console.error('Error updating payroll status:', error);
      throw error;
    }
  }
}