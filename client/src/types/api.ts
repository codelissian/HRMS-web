export interface ApiResponse<T = any> {
  status: boolean;
  message: string;
  data: T;
  total_count?: number;
  page_count?: number;
  page_size?: number;
  page?: number;
}

export interface PaginationRequest {
  page: number;
  page_size: number;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  select?: Record<string, any>;
  include?: Record<string, any>;
  search?: string | Record<string, any>;
}

export interface FilterRequest extends PaginationRequest {
  [key: string]: any;
}

export interface Permission {
  resource: string;
  actions: string[];
}

export interface UserPermissions {
  permissions: Permission[];
}

export type UserRole = 'system_admin' | 'org_admin' | 'hr_manager' | 'employee';

export interface StatsData {
  totalEmployees: number;
  presentToday: number;
  pendingLeaves: number;
  departments: number;
}
