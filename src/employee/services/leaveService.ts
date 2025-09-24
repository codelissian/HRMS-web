import { httpClient } from '@/lib/httpClient';
import { API_ENDPOINTS as API } from '@/services/api/endpoints';

export const employeeLeaveService = {
  async listMyLeaveRequests() {
    const resp = await httpClient.get(API.LEAVE_REQUESTS);
    return resp.data;
  },
};

