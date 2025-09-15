import type { Admin, Employee, Organisation } from './database';

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginRequest {
  email?: string;
  mobile?: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  full_name: string;
  password: string;
  mobile?: string;
}

export interface AuthResponse {
  admin?: Admin;
  employee?: Employee;
  organisation: Organisation;
  access_token: string;
  refresh_token: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  organisation_id: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  login: (data: AuthResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}
