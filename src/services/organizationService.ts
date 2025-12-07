import { httpClient } from '@/lib/httpClient';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import { Organisation } from '@/types/database';
import { ApiResponse } from '@/types/api';
import { authToken } from '@/services/authToken';

interface UpdateOrganizationRequest {
  id: string;
  name?: string;
  plan?: string;
  code?: string | null;
  description?: string | null;
  active_modules?: string[];
  half_day_threshold_hours?: number;
  default_working_day_rule_id?: string;
  time_zone?: string;
  time_zone_offset?: string;
  is_employee_code_generation_type_auto?: boolean;
  employee_code_prefix?: string | null;
  employee_code_from?: number;
  employee_code_current?: number;
  employee_code_to?: number;
  active_flag?: boolean;
}

interface GetOrganizationRequest {
  id: string;
  include?: {
    admin?: boolean;
    employees?: boolean;
    departments?: boolean;
    designations?: boolean;
  };
}

class OrganizationService {
  /**
   * Get organization details by ID
   * Note: For this endpoint, we don't send organisation_id in the request body
   * The interceptor is disabled for this specific endpoint
   */
  async getOrganization(
    id: string, 
    include?: {
      admin?: boolean;
      employees?: boolean;
      departments?: boolean;
      designations?: boolean;
    }
  ): Promise<ApiResponse<Organisation>> {
    const requestBody: GetOrganizationRequest = { id };
    
    if (include) {
      requestBody.include = include;
    }
    
    const response = await httpClient.post<ApiResponse<Organisation>>(
      API_ENDPOINTS.ORGANISATIONS_ONE,
      requestBody,
      { includeOrganisationId: false } // Don't add organisation_id for this endpoint
    );
    return response.data;
  }

  /**
   * Get current user's organization
   * Note: organisation_id is automatically added by the interceptor
   */
  async getCurrentOrganization(include?: {
    admin?: boolean;
    employees?: boolean;
    departments?: boolean;
    designations?: boolean;
  }): Promise<ApiResponse<Organisation>> {
    // Get organisation_id from authToken
    const organisationId = authToken.getorganisationId();
    
    if (!organisationId) {
      throw new Error('No organization ID found. Please login again.');
    }
    
    return this.getOrganization(organisationId, include);
  }

  /**
   * Update organization details
   * Note: organisation_id is automatically added by the interceptor
   */
  async updateOrganization(data: UpdateOrganizationRequest): Promise<ApiResponse<Organisation>> {
    const response = await httpClient.put<ApiResponse<Organisation>>(
      API_ENDPOINTS.ORGANISATIONS_UPDATE,
      data
    );
    return response.data;
  }

  /**
   * Get all organizations (for admin users)
   * Note: organisation_id is automatically added by the interceptor
   */
  async getOrganizations(): Promise<ApiResponse<Organisation[]>> {
    const response = await httpClient.post<ApiResponse<Organisation[]>>(
      API_ENDPOINTS.ORGANISATIONS_LIST,
      {}
    );
    return response.data;
  }
}

export const organizationService = new OrganizationService();

