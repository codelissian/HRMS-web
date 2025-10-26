import { httpClient } from '@/lib/httpClient';
import { API_ENDPOINTS } from './api/endpoints';
import { ApiResponse } from '@/types/api';
import { 
  Holiday, 
  CreateHolidayRequest, 
  UpdateHolidayRequest, 
  HolidayListRequest, 
  HolidayDetailRequest, 
  HolidayDeleteRequest 
} from '@/types/holiday';

class HolidayService {
  async getHolidays(params: HolidayListRequest): Promise<ApiResponse<Holiday[]>> {
    const response = await httpClient.post<ApiResponse<Holiday[]>>(API_ENDPOINTS.HOLIDAYS_LIST, {
      page: params.page,
      page_size: params.page_size
    });
    return response.data;
  }

  async getHoliday(id: string): Promise<ApiResponse<Holiday>> {
    const response = await httpClient.post<ApiResponse<Holiday>>(API_ENDPOINTS.HOLIDAYS_ONE, {
      id: id
    });
    return response.data;
  }

  async createHoliday(data: CreateHolidayRequest): Promise<ApiResponse<Holiday>> {
    const response = await httpClient.post<ApiResponse<Holiday>>(API_ENDPOINTS.HOLIDAYS_CREATE, data);
    return response.data;
  }

  async updateHoliday(data: UpdateHolidayRequest): Promise<ApiResponse<Holiday>> {
    const response = await httpClient.put<ApiResponse<Holiday>>(API_ENDPOINTS.HOLIDAYS_UPDATE, data);
    return response.data;
  }

  async deleteHoliday(id: string): Promise<ApiResponse<boolean>> {
    const response = await httpClient.post<ApiResponse<boolean>>(API_ENDPOINTS.HOLIDAYS_DELETE, {
      id: id
    });
    return response.data;
  }
}

export const holidayService = new HolidayService();
