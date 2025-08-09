// Backend base (POST/PUT/PATCH only; no GET)
export const API_BASE_URL = 'https://hrms-backend-omega.vercel.app/api/v1';

const API = {
  // Auth (open)
  AUTH_ADMIN_REGISTER: `${API_BASE_URL}/auth/admin/register`,
  AUTH_ADMIN_VERIFY: `${API_BASE_URL}/auth/admin/verify`,
  AUTH_ADMIN_LOGIN: `${API_BASE_URL}/auth/admin/login`,
  AUTH_ADMIN_RESET_PASSWORD: `${API_BASE_URL}/auth/admin/reset-password`,
  AUTH_ADMIN_PERMISSIONS: `${API_BASE_URL}/auth/admin/permissions`,

  AUTH_EMPLOYEE_LOGIN: `${API_BASE_URL}/auth/employee/login`,
  AUTH_EMPLOYEE_RESET_PASSWORD: `${API_BASE_URL}/auth/employee/reset-password`,
  AUTH_EMPLOYEE_PERMISSIONS: `${API_BASE_URL}/auth/employee/permissions`,

  // Settings
  SETTINGS_SEND_SMS: `${API_BASE_URL}/settings/send/sms`,
  SETTINGS_SEND_EMAIL: `${API_BASE_URL}/settings/send/email`,
  SETTINGS_UPLOAD_IMAGES: `${API_BASE_URL}/settings/images/upload`,
  SETTINGS_CREATE: `${API_BASE_URL}/settings/create`,
  SETTINGS_UPDATE: `${API_BASE_URL}/settings/update`,
  SETTINGS_LIST: `${API_BASE_URL}/settings/list`,
  SETTINGS_ONE: `${API_BASE_URL}/settings/one`,
  SETTINGS_DELETE: `${API_BASE_URL}/settings/delete`,

  // Admins
  ADMINS_CREATE: `${API_BASE_URL}/admins/create`,
  ADMINS_UPDATE: `${API_BASE_URL}/admins/update`,
  ADMINS_LIST: `${API_BASE_URL}/admins/list`,
  ADMINS_ONE: `${API_BASE_URL}/admins/one`,
  ADMINS_DELETE: `${API_BASE_URL}/admins/delete`,

  // Organisations
  ORGANISATIONS_CREATE: `${API_BASE_URL}/organisations/create`,
  ORGANISATIONS_UPDATE: `${API_BASE_URL}/organisations/update`,
  ORGANISATIONS_LIST: `${API_BASE_URL}/organisations/list`,
  ORGANISATIONS_ONE: `${API_BASE_URL}/organisations/one`,
  ORGANISATIONS_DELETE: `${API_BASE_URL}/organisations/delete`,

  // Employees
  EMPLOYEES_CREATE: `${API_BASE_URL}/employees/create`,
  EMPLOYEES_UPDATE: `${API_BASE_URL}/employees/update`,
  EMPLOYEES_LIST: `${API_BASE_URL}/employees/list`,
  EMPLOYEES_ONE: `${API_BASE_URL}/employees/one`,
  EMPLOYEES_DELETE: `${API_BASE_URL}/employees/delete`,

  // Departments
  DEPARTMENTS_CREATE: `${API_BASE_URL}/departments/create`,
  DEPARTMENTS_UPDATE: `${API_BASE_URL}/departments/update`,
  DEPARTMENTS_LIST: `${API_BASE_URL}/departments/list`,
  DEPARTMENTS_ONE: `${API_BASE_URL}/departments/one`,
  DEPARTMENTS_DELETE: `${API_BASE_URL}/departments/delete`,

  // Designations
  DESIGNATIONS_CREATE: `${API_BASE_URL}/designations/create`,
  DESIGNATIONS_UPDATE: `${API_BASE_URL}/designations/update`,
  DESIGNATIONS_LIST: `${API_BASE_URL}/designations/list`,
  DESIGNATIONS_ONE: `${API_BASE_URL}/designations/one`,
  DESIGNATIONS_DELETE: `${API_BASE_URL}/designations/delete`,

  // Shifts
  SHIFTS_CREATE: `${API_BASE_URL}/shifts/create`,
  SHIFTS_UPDATE: `${API_BASE_URL}/shifts/update`,
  SHIFTS_LIST: `${API_BASE_URL}/shifts/list`,
  SHIFTS_ONE: `${API_BASE_URL}/shifts/one`,
  SHIFTS_DELETE: `${API_BASE_URL}/shifts/delete`,

  // Roles
  ROLES_CREATE: `${API_BASE_URL}/roles/create`,
  ROLES_UPDATE: `${API_BASE_URL}/roles/update`,
  ROLES_LIST: `${API_BASE_URL}/roles/list`,
  ROLES_ONE: `${API_BASE_URL}/roles/one`,
  ROLES_DELETE: `${API_BASE_URL}/roles/delete`,

  // Permissions
  PERMISSIONS_CREATE: `${API_BASE_URL}/permissions/create`,
  PERMISSIONS_UPDATE: `${API_BASE_URL}/permissions/update`,
  PERMISSIONS_LIST: `${API_BASE_URL}/permissions/list`,
  PERMISSIONS_ONE: `${API_BASE_URL}/permissions/one`,
  PERMISSIONS_DELETE: `${API_BASE_URL}/permissions/delete`,

  // Attendance Policies
  ATTENDANCE_POLICIES_CREATE: `${API_BASE_URL}/attendance-policies/create`,
  ATTENDANCE_POLICIES_UPDATE: `${API_BASE_URL}/attendance-policies/update`,
  ATTENDANCE_POLICIES_LIST: `${API_BASE_URL}/attendance-policies/list`,
  ATTENDANCE_POLICIES_ONE: `${API_BASE_URL}/attendance-policies/one`,
  ATTENDANCE_POLICIES_DELETE: `${API_BASE_URL}/attendance-policies/delete`,

  // Attendance
  ATTENDANCE_CREATE: `${API_BASE_URL}/attendance/create`,
  ATTENDANCE_UPDATE: `${API_BASE_URL}/attendance/update`,
  ATTENDANCE_LIST: `${API_BASE_URL}/attendance/list`,
  ATTENDANCE_ONE: `${API_BASE_URL}/attendance/one`,
  ATTENDANCE_DELETE: `${API_BASE_URL}/attendance/delete`,

  // Leaves
  LEAVES_CREATE: `${API_BASE_URL}/leaves/create`,
  LEAVES_UPDATE: `${API_BASE_URL}/leaves/update`,
  LEAVES_LIST: `${API_BASE_URL}/leaves/list`,
  LEAVES_ONE: `${API_BASE_URL}/leaves/one`,
  LEAVES_DELETE: `${API_BASE_URL}/leaves/delete`,

  // Leave Requests
  LEAVE_REQUESTS_CREATE: `${API_BASE_URL}/leave-requests/create`,
  LEAVE_REQUESTS_UPDATE: `${API_BASE_URL}/leave-requests/update`,
  LEAVE_REQUESTS_LIST: `${API_BASE_URL}/leave-requests/list`,
  LEAVE_REQUESTS_ONE: `${API_BASE_URL}/leave-requests/one`,
  LEAVE_REQUESTS_DELETE: `${API_BASE_URL}/leave-requests/delete`,

  // Leave Encashments
  LEAVE_ENCASHMENTS_CREATE: `${API_BASE_URL}/leave-encashments/create`,
  LEAVE_ENCASHMENTS_UPDATE: `${API_BASE_URL}/leave-encashments/update`,
  LEAVE_ENCASHMENTS_LIST: `${API_BASE_URL}/leave-encashments/list`,
  LEAVE_ENCASHMENTS_ONE: `${API_BASE_URL}/leave-encashments/one`,
  LEAVE_ENCASHMENTS_DELETE: `${API_BASE_URL}/leave-encashments/delete`,

  // Provider Configurations
  PROVIDER_CONFIGURATIONS_CREATE: `${API_BASE_URL}/provider_configurations/create`,
  PROVIDER_CONFIGURATIONS_UPDATE: `${API_BASE_URL}/provider_configurations/update`,
  PROVIDER_CONFIGURATIONS_LIST: `${API_BASE_URL}/provider_configurations/list`,
  PROVIDER_CONFIGURATIONS_ONE: `${API_BASE_URL}/provider_configurations/one`,
  PROVIDER_CONFIGURATIONS_DELETE: `${API_BASE_URL}/provider_configurations/delete`,

  // Currency Exchange Rates
  CURRENCY_EXCHANGE_RATES_CREATE: `${API_BASE_URL}/currency-exchange-rates/create`,
  CURRENCY_EXCHANGE_RATES_UPDATE: `${API_BASE_URL}/currency-exchange-rates/update`,
  CURRENCY_EXCHANGE_RATES_LIST: `${API_BASE_URL}/currency-exchange-rates/list`,
  CURRENCY_EXCHANGE_RATES_ONE: `${API_BASE_URL}/currency-exchange-rates/one`,
  CURRENCY_EXCHANGE_RATES_DELETE: `${API_BASE_URL}/currency-exchange-rates/delete`,
};

export const API_ENDPOINTS = API;
export const $apiUrl = API; // optional alias

export default API;