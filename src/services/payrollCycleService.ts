import { httpClient } from './httpClient';
import { API_ENDPOINTS } from './api/endpoints';
import { 
  PayrollCycle, 
  CreatePayrollCycleData, 
  UpdatePayrollCycleData, 
  PayrollCyclesResponse 
} from '@/types/payrollCycle';

export class PayrollCycleService {
  static async createPayrollCycle(payrollCycleData: CreatePayrollCycleData): Promise<PayrollCycle> {
    const response = await httpClient.post(API_ENDPOINTS.PAYROLL_CYCLES_CREATE, payrollCycleData);
    if (response.data.status && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Creation failed');
    }
  }

  static async getPayrollCycles(): Promise<PayrollCyclesResponse> {
    const response = await httpClient.post(API_ENDPOINTS.PAYROLL_CYCLES_LIST, {});
    return response.data;
  }

  static async getPayrollCycle(id: string): Promise<PayrollCycle> {
    const response = await httpClient.post(API_ENDPOINTS.PAYROLL_CYCLES_ONE, { id });
    if (response.data.status && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Fetch failed');
    }
  }

  static async updatePayrollCycle(id: string, payrollCycleData: Partial<CreatePayrollCycleData> & { active_flag?: boolean }): Promise<PayrollCycle> {
    const updatePayload = {
      id,
      name: payrollCycleData.name || '',
      pay_period_start: payrollCycleData.pay_period_start || '',
      pay_period_end: payrollCycleData.pay_period_end || '',
      status: payrollCycleData.status || 'DRAFT',
      salary_month: payrollCycleData.salary_month || 1,
      salary_year: payrollCycleData.salary_year || new Date().getFullYear(),
      working_days: payrollCycleData.working_days || 0,
      active_flag: payrollCycleData.active_flag !== undefined ? payrollCycleData.active_flag : true
    };
    
    try {
      const response = await httpClient.put(API_ENDPOINTS.PAYROLL_CYCLES_UPDATE, updatePayload);
      
      if (response.data.status && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error: any) {
      console.error('Error updating payroll cycle:', error);
      throw error;
    }
  }

  static async deletePayrollCycle(id: string): Promise<void> {
    await httpClient.patch(API_ENDPOINTS.PAYROLL_CYCLES_DELETE, { id });
  }

  static async togglePayrollCycleStatus(id: string, active_flag: boolean): Promise<PayrollCycle> {
    const updatePayload = {
      id,
      active_flag
    };
    
    try {
      const response = await httpClient.put(API_ENDPOINTS.PAYROLL_CYCLES_UPDATE, updatePayload);
      
      if (response.data.status && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Status update failed');
      }
    } catch (error: any) {
      console.error('Error updating payroll cycle status:', error);
      throw error;
    }
  }

  static async updatePayrollCycleStatus(id: string, status: 'DRAFT' | 'PROCESSING' | 'PAID'): Promise<PayrollCycle> {
    const updatePayload = {
      id,
      status
    };
    
    try {
      const response = await httpClient.put(API_ENDPOINTS.PAYROLL_CYCLES_UPDATE, updatePayload);
      
      if (response.data.status && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Status update failed');
      }
    } catch (error: any) {
      console.error('Error updating payroll cycle status:', error);
      throw error;
    }
  }
}