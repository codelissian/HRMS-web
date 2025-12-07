// Backend base (POST/PUT/PATCH only; no GET)
export const API_BASE_URL = 'http://35.224.247.153:9000/api/v1';

const API = {
  // Auth (open)
  AUTH_ADMIN_REGISTER: `/auth/admin/register`,
  AUTH_ADMIN_VERIFY: `/auth/admin/verify`,
  AUTH_ADMIN_LOGIN: `/auth/admin/login`,
  AUTH_ADMIN_RESET_PASSWORD: `/auth/admin/reset-password`,
  AUTH_ADMIN_PERMISSIONS: `/auth/admin/permissions`,

  AUTH_EMPLOYEE_LOGIN: `/auth/employee/login`,
  AUTH_EMPLOYEE_RESET_PASSWORD: `/auth/employee/reset-password`,
  AUTH_EMPLOYEE_PERMISSIONS: `/auth/employee/permissions`,

  // Settings
  SETTINGS_SEND_SMS: `/settings/send/sms`,
  SETTINGS_SEND_EMAIL: `/settings/send/email`,
  SETTINGS_UPLOAD_IMAGES: `/settings/images/upload`,
  SETTINGS_CREATE: `/settings/create`,
  SETTINGS_UPDATE: `/settings/update`,
  SETTINGS_LIST: `/settings/list`,
  SETTINGS_ONE: `/settings/one`,
  SETTINGS_DELETE: `/settings/delete`,

  // Admins
  ADMINS_CREATE: `/admins/create`,
  ADMINS_UPDATE: `/admins/update`,
  ADMINS_LIST: `/admins/list`,
  ADMINS_ONE: `/admins/one`,
  ADMINS_DELETE: `/admins/delete`,

  // Organisations
  ORGANISATIONS_CREATE: `/organisations/create`,
  ORGANISATIONS_UPDATE: `/organisations/update`,
  ORGANISATIONS_LIST: `/organisations/list`,
  ORGANISATIONS_ONE: `/organisations/one`,
  ORGANISATIONS_DELETE: `/organisations/delete`,

  // Employees
  EMPLOYEES_CREATE: `/employees/create`,
  EMPLOYEES_UPDATE: `/employees/update`,
  EMPLOYEES_UPDATE_MANY: `/employees/update-many`,
  EMPLOYEES_LIST: `/employees/list`,
  EMPLOYEES_ONE: `/employees/one`,
  EMPLOYEES_DELETE: `/employees/delete`,
  EMPLOYEES_ATTENDANCE: `/employees/attendance`,

  // Departments
  DEPARTMENTS_CREATE: `/departments/create`,
  DEPARTMENTS_UPDATE: `/departments/update`,
  DEPARTMENTS_LIST: `/departments/list`,
  DEPARTMENTS_ONE: `/departments/one`,
  DEPARTMENTS_DELETE: `/departments/delete`,

  // Designations
  DESIGNATIONS_CREATE: `/designations/create`,
  DESIGNATIONS_UPDATE: `/designations/update`,
  DESIGNATIONS_LIST: `/designations/list`,
  DESIGNATIONS_LIST_WITH_EMPLOYEE_COUNT: `/designations/list-with-employee-count`,
  DESIGNATIONS_ONE: `/designations/one`,
  DESIGNATIONS_DELETE: `/designations/delete`,

  // Shifts
  SHIFTS_CREATE: `/shifts/create`,
  SHIFTS_UPDATE: `/shifts/update`, // Back to the working endpoint from Postman
  SHIFTS_LIST: `/shifts/list`,
  SHIFTS_ONE: `/shifts/one`,
  SHIFTS_DELETE: `/shifts/delete`,

  // Roles
  ROLES_CREATE: `/roles/create`,
  ROLES_UPDATE: `/roles/update`,
  ROLES_LIST: `/roles/list`,
  ROLES_ONE: `/roles/one`,
  ROLES_DELETE: `/roles/delete`,

  // Permissions
  PERMISSIONS_CREATE: `/permissions/create`,
  PERMISSIONS_UPDATE: `/permissions/update`,
  PERMISSIONS_LIST: `/permissions/list`,
  PERMISSIONS_ONE: `/permissions/one`,
  PERMISSIONS_DELETE: `/permissions/delete`,

  // Attendance Policies
  ATTENDANCE_POLICIES_CREATE: `/attendance_rules/create`,
  ATTENDANCE_POLICIES_UPDATE: `/attendance_rules/update`,
  ATTENDANCE_POLICIES_LIST: `/attendance_rules/list`,
  ATTENDANCE_POLICIES_ONE: `/attendance_rules/one`,
  ATTENDANCE_POLICIES_DELETE: `/attendance_rules/delete`,

  // Attendance
  ATTENDANCE_CREATE: `/attendance/create`,
  ATTENDANCE_UPDATE: `/attendance/update`,
  ATTENDANCE_LIST: `/attendance/list`,
  ATTENDANCE_ONE: `/attendance/one`,
  ATTENDANCE_DELETE: `/attendance/delete`,
  ATTENDANCE_DAY: `/attendance/day`,
  ATTENDANCE_STATISTICS: `/attendance/statistics`,
  ATTENDANCE_CALENDAR: `/attendance/calendar`,

  // Leaves
  LEAVES_CREATE: `/leaves/create`,
  LEAVES_UPDATE: `/leaves/update`,
  LEAVES_LIST: `/leaves/list`,
  LEAVES_ONE: `/leaves/one`,
  LEAVES_DELETE: `/leaves/delete`,

  // Leave Requests
  LEAVE_REQUESTS_CREATE: `/leave_requests/create`,
  LEAVE_REQUESTS_UPDATE: `/requests/update_status`,
  LEAVE_REQUESTS_LIST: `/requests/list`,
  LEAVE_REQUESTS_ONE: `/requests/one`,
  LEAVE_REQUESTS_DELETE: `/leave_requests/delete`,
  LEAVE_REQUESTS_STATISTICS: `/requests/statistics`,

  // Holidays
  HOLIDAYS_CREATE: `/holidays/create`,
  HOLIDAYS_UPDATE: `/holidays/update`,
  HOLIDAYS_LIST: `/holidays/list`,
  HOLIDAYS_ONE: `/holidays/one`,
  HOLIDAYS_DELETE: `/holidays/delete`,

  // Leave Encashments
  LEAVE_ENCASHMENTS_CREATE: `/leave-encashments/create`,
  LEAVE_ENCASHMENTS_UPDATE: `/leave-encashments/update`,
  LEAVE_ENCASHMENTS_LIST: `/leave-encashments/list`,
  LEAVE_ENCASHMENTS_ONE: `/leave-encashments/one`,
  LEAVE_ENCASHMENTS_DELETE: `/leave-encashments/delete`,

  // Provider Configurations
  PROVIDER_CONFIGURATIONS_CREATE: `/provider_configurations/create`,
  PROVIDER_CONFIGURATIONS_UPDATE: `/provider_configurations/update`,
  PROVIDER_CONFIGURATIONS_LIST: `/provider_configurations/list`,
  PROVIDER_CONFIGURATIONS_ONE: `/provider_configurations/one`,
  PROVIDER_CONFIGURATIONS_DELETE: `/provider_configurations/delete`,

  // Currency Exchange Rates
  CURRENCY_EXCHANGE_RATES_CREATE: `/currency-exchange-rates/create`,
  CURRENCY_EXCHANGE_RATES_UPDATE: `/currency-exchange-rates/update`,
  CURRENCY_EXCHANGE_RATES_LIST: `/currency-exchange-rates/list`,
  CURRENCY_EXCHANGE_RATES_ONE: `/currency-exchange-rates/one`,
  CURRENCY_EXCHANGE_RATES_DELETE: `/currency-exchange-rates/delete`,

  // Work Day Rules
  WORK_DAY_RULES_CREATE: `/working_day_rules/create`,
  WORK_DAY_RULES_UPDATE: `/working_day_rule/update`,
  WORK_DAY_RULES_LIST: `/working_day_rules/list`,
  WORK_DAY_RULES_ONE: `/working_day_rule/one`,
  WORK_DAY_RULES_DELETE: `/working_day_rule/delete`,

  // Salary Components
  SALARY_COMPONENTS_CREATE: `/salary_components/create`,
  SALARY_COMPONENTS_UPDATE: `/salary_components/update`,
  SALARY_COMPONENTS_LIST: `/salary_components/list`,
  SALARY_COMPONENTS_ONE: `/salary_components/one`,
  SALARY_COMPONENTS_DELETE: `/salary_components/delete`,

  // Salary Component Types
  SALARY_COMPONENT_TYPES_CREATE: `/salary_component_types/create`,
  SALARY_COMPONENT_TYPES_UPDATE: `/salary_component_types/update`,
  SALARY_COMPONENT_TYPES_LIST: `/salary_component_types/list`,
  SALARY_COMPONENT_TYPES_ONE: `/salary_component_types/one`,
  SALARY_COMPONENT_TYPES_DELETE: `/salary_component_types/delete`,

  // Payroll Cycles
  PAYROLL_CYCLES_CREATE: `/payroll_cycles/create`,
  PAYROLL_CYCLES_UPDATE: `/payroll_cycles/update`,
  PAYROLL_CYCLES_LIST: `/payroll_cycles/list`,
  PAYROLL_CYCLES_ONE: `/payroll_cycles/one`,
  PAYROLL_CYCLES_DELETE: `/payroll_cycles/delete`,

  // Payrolls
  PAYROLLS_CREATE: `/payrolls/create`,
  PAYROLLS_UPDATE: `/payrolls/update`,
  PAYROLLS_LIST: `/payrolls/list`,
  PAYROLLS_ONE: `/payrolls/one`,
  PAYROLLS_DELETE: `/payrolls/delete`,
  PAYROLLS_DOWNLOAD: `/payrolls/download`,
};

export const API_ENDPOINTS = API;
export const $apiUrl = API; // optional alias

export default API;