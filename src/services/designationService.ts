import { httpClient } from '@/services/httpClient';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import { ApiResponse } from '@/types/api';

export interface Designation {
  id: string;
  name: string;
  positions: number;
  department_id: string;
  organisation_id: string;
  active_flag: boolean;
  delete_flag: boolean;
  created_at: Date;
  modified_at: Date;
  created_by?: string;
  modified_by?: string;
}

interface GetDesignationsRequest {
  department_id?: string; // Make department_id optional
}

interface DeleteDesignationRequest {
  id: string;
}

interface CreateDesignationRequest {
  name: string;
  department_id: string;
  description?: string;
}

interface UpdateDesignationRequest {
  id: string;
  name: string;
  department_id: string;
  description?: string;
}

class DesignationService {
  async getDesignations(filters: GetDesignationsRequest): Promise<ApiResponse<Designation[]>> {
    const response = await httpClient.post<ApiResponse<Designation[]>>(
      API_ENDPOINTS.DESIGNATIONS_LIST,
      filters
    );
    return response.data;
  }

  // New method to get all designations for an organization
  async getAllDesignations(): Promise<ApiResponse<Designation[]>> {
    const response = await httpClient.post<ApiResponse<Designation[]>>(
      API_ENDPOINTS.DESIGNATIONS_LIST,
      {}
    );
    return response.data;
  }

  // Create designation method
  async createDesignation(data: CreateDesignationRequest): Promise<ApiResponse<Designation>> {
    const response = await httpClient.post<ApiResponse<Designation>>(
      API_ENDPOINTS.DESIGNATIONS_CREATE,
      data
    );
    return response.data;
  }

  // Update designation method
  async updateDesignation(data: UpdateDesignationRequest): Promise<ApiResponse<Designation>> {
    const response = await httpClient.put<ApiResponse<Designation>>(
      API_ENDPOINTS.DESIGNATIONS_UPDATE,
      data
    );
    return response.data;
  }

  // Delete designation method
  async deleteDesignation(designationId: string): Promise<ApiResponse<any>> {
    const response = await httpClient.patch<ApiResponse<any>>(
      API_ENDPOINTS.DESIGNATIONS_DELETE,
      { id: designationId }
    );
    return response.data;
  }
}

export const designationService = new DesignationService(); 