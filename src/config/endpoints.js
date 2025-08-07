/**
 * API Endpoints Configuration
 * Similar to your Vue.js $apiUrl pattern
 */

const API_BASE_URL = 'https://hrms-backend-omega.vercel.app/api/v1';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH_LOGIN: `${API_BASE_URL}/auth/login`,
  AUTH_LOGOUT: `${API_BASE_URL}/auth/logout`,
  AUTH_PROFILE: `${API_BASE_URL}/auth/profile`,
  AUTH_REGISTER: `${API_BASE_URL}/auth/register`,
  
  // Employee endpoints
  GET_EMPLOYEES: `${API_BASE_URL}/employees`,
  GET_EMPLOYEE: (id) => `${API_BASE_URL}/employees/${id}`,
  CREATE_EMPLOYEE: `${API_BASE_URL}/employees`,
  UPDATE_EMPLOYEE: (id) => `${API_BASE_URL}/employees/${id}`,
  DELETE_EMPLOYEE: (id) => `${API_BASE_URL}/employees/${id}`,
  
  // Transaction endpoints (if you have them)
  GET_TRANSACTION_LIST: `${API_BASE_URL}/transactions`,
  GET_TRANSACTION: (id) => `${API_BASE_URL}/transactions/${id}`,
  CREATE_TRANSACTION: `${API_BASE_URL}/transactions`,
  UPDATE_TRANSACTION: (id) => `${API_BASE_URL}/transactions/${id}`,
  DELETE_TRANSACTION: (id) => `${API_BASE_URL}/transactions/${id}`,
  
  // Leave endpoints
  GET_LEAVES: `${API_BASE_URL}/leaves`,
  GET_LEAVE: (id) => `${API_BASE_URL}/leaves/${id}`,
  CREATE_LEAVE: `${API_BASE_URL}/leaves`,
  UPDATE_LEAVE: (id) => `${API_BASE_URL}/leaves/${id}`,
  DELETE_LEAVE: (id) => `${API_BASE_URL}/leaves/${id}`,
  
  // Payroll endpoints
  GET_PAYROLL: `${API_BASE_URL}/payroll`,
  GET_PAYROLL_ITEM: (id) => `${API_BASE_URL}/payroll/${id}`,
  CREATE_PAYROLL: `${API_BASE_URL}/payroll`,
  UPDATE_PAYROLL: (id) => `${API_BASE_URL}/payroll/${id}`,
  DELETE_PAYROLL: (id) => `${API_BASE_URL}/payroll/${id}`,
  
  // Organization endpoints
  GET_BRANCHES: `${API_BASE_URL}/organization/branches`,
  GET_BRANCH: (id) => `${API_BASE_URL}/organization/branches/${id}`,
  CREATE_BRANCH: `${API_BASE_URL}/organization/branches`,
  UPDATE_BRANCH: (id) => `${API_BASE_URL}/organization/branches/${id}`,
  DELETE_BRANCH: (id) => `${API_BASE_URL}/organization/branches/${id}`,
};

// For backward compatibility (similar to your Vue.js pattern)
export const $apiUrl = API_ENDPOINTS;

export default API_ENDPOINTS; 