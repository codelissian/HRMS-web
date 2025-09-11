import { httpClient } from './httpClient';
import { API_ENDPOINTS } from './api/endpoints';
import { getOrganisationId } from '@/lib/shift-utils';

export interface CreateShiftData {
  name: string;
  start: string;
  end: string;
  grace_minutes: number;
  active_flag?: boolean;
}

export interface UpdateShiftData {
  id: string;
  name: string;
  start: string;
  end: string;
  grace_minutes: number;
  active_flag: boolean;
}

export interface Shift {
  id: string;
  name: string;
  start: string;
  end: string;
  grace_minutes: number;
  organisation_id: string;
  active_flag: boolean;
  delete_flag: boolean;
  modified_at: string;
  created_at: string;
  created_by: string | null;
  modified_by: string | null;
}

export interface ShiftsResponse {
  status: boolean;
  message: string;
  data: Shift[];
  total_count: number;
  page_count: number;
  page_size: number;
  page: number;
}

export class ShiftService {
  static async createShift(shiftData: CreateShiftData): Promise<Shift> {
    const response = await httpClient.post(API_ENDPOINTS.SHIFTS_CREATE, shiftData);
    // Return the actual shift data, not the entire response
    if (response.data.status && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Creation failed');
    }
  }

  static async getShifts(): Promise<ShiftsResponse> {
    const response = await httpClient.post(API_ENDPOINTS.SHIFTS_LIST, {});
    return response.data;
  }

  static async getShift(id: string): Promise<Shift> {
    const response = await httpClient.post(API_ENDPOINTS.SHIFTS_ONE, { id });
    // Return the actual shift data, not the entire response
    if (response.data.status && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Fetch failed');
    }
  }

  static async updateShift(id: string, shiftData: Partial<CreateShiftData> & { active_flag?: boolean }): Promise<Shift> {
    // Create the update payload with full time format (HH:MM)
    const updatePayload = {
      id,
      name: shiftData.name || '',
      start: shiftData.start || '00:00',
      end: shiftData.end || '00:00',
      grace_minutes: shiftData.grace_minutes || 0,
      active_flag: shiftData.active_flag !== undefined ? shiftData.active_flag : true
    };
    
    try {
      const response = await httpClient.put(API_ENDPOINTS.SHIFTS_UPDATE, updatePayload);
      
      // Return the actual shift data, not the entire response
      if (response.data.status && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error: any) {
      console.error('Error updating shift:', error);
      throw error;
    }
  }

  static async deleteShift(id: string): Promise<void> {
    await httpClient.patch(API_ENDPOINTS.SHIFTS_DELETE, { id });
  }

  static async toggleShiftStatus(id: string, active_flag: boolean): Promise<Shift> {
    // Only update the active_flag field
    const updatePayload = {
      id,
      active_flag
    };
    
    try {
      const response = await httpClient.put(API_ENDPOINTS.SHIFTS_UPDATE, updatePayload);
      
      // Return the actual shift data, not the entire response
      if (response.data.status && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Status update failed');
      }
    } catch (error: any) {
      console.error('Error updating shift status:', error);
      throw error;
    }
  }
} 