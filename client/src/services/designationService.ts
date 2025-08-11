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
  organisation_id: string;
  department_id?: string; // Make department_id optional
}

interface DeleteDesignationRequest {
  id: string;
}

interface CreateDesignationRequest {
  name: string;
  department_id: string;
  organisation_id: string;
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
  async getAllDesignations(organisationId: string): Promise<ApiResponse<Designation[]>> {
    const response = await httpClient.post<ApiResponse<Designation[]>>(
      API_ENDPOINTS.DESIGNATIONS_LIST,
      { organisation_id: organisationId }
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