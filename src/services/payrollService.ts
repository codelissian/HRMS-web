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

  static async getPayrolls(params?: { page?: number; page_size?: number; search?: any }): Promise<PayrollsResponse> {
    const response = await httpClient.post(API_ENDPOINTS.PAYROLLS_LIST, {
      page: params?.page || 1,
      page_size: params?.page_size || 10,
      include: ["employee", "organisation"],
      ...(params?.search && { search: params.search })
    });
    return response.data;
  }

  static async getPayrollsByCycle(payrollCycleId: string, params?: { page?: number; page_size?: number; search?: any }): Promise<PayrollsResponse> {
    const response = await httpClient.post(API_ENDPOINTS.PAYROLLS_LIST, {
      payroll_cycle_id: payrollCycleId,
      page: params?.page || 1,
      page_size: params?.page_size || 10,
      include: ["employee", "organisation"],
      ...(params?.search && { search: params.search })
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

  static async downloadPayroll(id: string): Promise<string> {
    try {
      const response = await httpClient.post(API_ENDPOINTS.PAYROLLS_DOWNLOAD, { id }, {
        responseType: 'text' as any // Expect HTML response as text
      });
      
      // If response is HTML string, return it directly
      if (typeof response.data === 'string') {
        return response.data;
      }
      
      // If response is wrapped in an object, extract the HTML
      if (response.data && typeof response.data === 'object' && (response.data as any).html) {
        return (response.data as any).html;
      }
      
      // If response.data is an object, try to stringify it
      if (response.data && typeof response.data === 'object') {
        return JSON.stringify(response.data);
      }
      
      throw new Error('Invalid response format from download API');
    } catch (error: any) {
      console.error('Error downloading payroll:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to download payroll');
    }
  }
}