import { z } from "zod";

// Form validation schemas for frontend
// These should match the backend validation requirements

export const adminFormSchema = z.object({
  full_name: z.string().optional(),
  mobile: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().optional(),
  image: z.string().optional(),
  username: z.string().optional(),
  alternate_mobile: z.string().optional(),
  address: z.string().optional(),
  documents: z.array(z.string()).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  pin_code: z.string().optional(),
  adhaar_number: z.string().optional(),
  driving_license_number: z.string().optional(),
});

export const organisationFormSchema = z.object({
  admin_id: z.string().optional(),
  name: z.string().min(1, "Organisation name is required"),
  plan: z.string().optional(),
  active_modules: z.array(z.string()).optional(),
});

export const employeeFormSchema = z.object({
  name: z.string().min(1, "Employee name is required"),
  mobile: z.string().min(1, "Mobile number is required"),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().optional(),
  included_in_payroll: z.boolean().optional(),
  date_of_birth: z.string().optional(),
  address: z.string().optional(),
  pan_number: z.string().optional(),
  status: z.string().optional(),
  joining_date: z.string().optional(),
  organisation_id: z.string().optional(),
  department_id: z.string().optional(),
  designation_id: z.string().optional(),
  shift_id: z.string().optional(),
  attendance_rule_id: z.string().optional(),
  geo_radius_meters: z.number().min(1, "Radius must be at least 1 meter").optional(),
  bank_details: z.any().optional(),
});

export const departmentFormSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  description: z.string().optional(),
  organisation_id: z.string().min(1, "Organisation ID is required"),
});

export const designationFormSchema = z.object({
  name: z.string().min(1, "Designation name is required"),
  organisation_id: z.string().min(1, "Organisation ID is required"),
});

export const shiftFormSchema = z.object({
  name: z.string().min(1, "Shift name is required"),
  start: z.string().min(1, "Start time is required"),
  end: z.string().min(1, "End time is required"),
  grace_minutes: z.number().optional(),
  organisation_id: z.string().min(1, "Organisation ID is required"),
});

export const leaveFormSchema = z.object({
  // ✅ Required fields
  name: z.string().min(1, "Leave name is required"),
  code: z.string().min(1, "Leave code is required"),
  
  // ✅ Optional fields that backend accepts
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  expiry_method: z.string().optional(), // ✅ Added: Backend expects this field
  accrual_method: z.string().optional(),
  accrual_rate: z.number().optional(),
  allow_carry_forward: z.boolean().optional(),
  carry_forward_limit: z.number().optional(),
  carry_forward_expiry_months: z.number().optional(),
  allow_encashment: z.boolean().optional(),
  encashment_rate: z.number().optional(),
  requires_approval: z.boolean().optional(),
  requires_documentation: z.boolean().optional(),
  required_documents: z.any().optional(),
  auto_approve_for_days: z.number().optional(),
  approval_levels: z.number().optional(),
  min_service_months: z.number().optional(),
  min_advance_notice_days: z.number().optional(),
  max_consecutive_days: z.number().optional(),
  blackout_dates: z.any().optional(),
  
  // ❌ Removed fields that backend doesn't accept:
  // category, initial_balance, max_balance, min_balance, active_flag
});

export const leaveRequestFormSchema = z.object({
  employee_id: z.string().min(1, "Employee ID is required"),
  leave_id: z.string().min(1, "Leave ID is required"),
  organisation_id: z.string().min(1, "Organisation ID is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  total_days: z.number().min(1, "Total days must be at least 1"),
  reason: z.string().optional(),
  comments: z.string().optional(),
  status: z.string().optional(),
  is_half_day: z.boolean().optional(),
  work_handover_to: z.string().optional(),
  handover_notes: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  approver_comments: z.string().optional(),
  approved_at: z.string().optional(),
  rejected_at: z.string().optional(),
  attachments: z.array(z.any()).optional(),
  approvals: z.array(z.any()).optional(),
});

export const roleFormSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
  organisation_id: z.string().optional(),
});

export const permissionFormSchema = z.object({
  resource: z.string().min(1, "Resource is required"),
  actions: z.array(z.string()).min(1, "At least one action is required"),
  description: z.string().optional(),
  organisation_id: z.string().optional(),
});

// Type exports for form data
export type AdminFormData = z.infer<typeof adminFormSchema>;
export type OrganisationFormData = z.infer<typeof organisationFormSchema>;
export type EmployeeFormData = z.infer<typeof employeeFormSchema>;
export type DepartmentFormData = z.infer<typeof departmentFormSchema>;
export type DesignationFormData = z.infer<typeof designationFormSchema>;
export type ShiftFormData = z.infer<typeof shiftFormSchema>;
export type LeaveFormData = z.infer<typeof leaveFormSchema>;
export type LeaveRequestFormData = z.infer<typeof leaveRequestFormSchema>;
export type RoleFormData = z.infer<typeof roleFormSchema>;
export type PermissionFormData = z.infer<typeof permissionFormSchema>;