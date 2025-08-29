import { pgTable, text, varchar, boolean, timestamp, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const admins = pgTable("admins", {
  id: varchar("id").primaryKey(),
  full_name: text("full_name"),
  mobile: text("mobile"),
  email: text("email").unique(),
  password: text("password"),
  image: text("image"),
  username: text("username"),
  alternate_mobile: text("alternate_mobile"),
  address: text("address"),
  documents: json("documents").$type<string[]>(),
  city: text("city"),
  state: text("state"),
  country: text("country"),
  pin_code: text("pin_code"),
  adhaar_number: text("adhaar_number"),
  driving_license_number: text("driving_license_number"),
  active_flag: boolean("active_flag").default(true),
  delete_flag: boolean("delete_flag").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const organisations = pgTable("organisations", {
  id: varchar("id").primaryKey(),
  admin_id: varchar("admin_id"),
  name: text("name").notNull().unique(),
  plan: text("plan").default("Free"),
  active_modules: json("active_modules").$type<string[]>(),
  active_flag: boolean("active_flag").default(true),
  delete_flag: boolean("delete_flag").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const employees = pgTable("employees", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  mobile: text("mobile").notNull(),
  email: text("email"),
  password: text("password"),
  included_in_payroll: boolean("included_in_payroll").default(false),
  date_of_birth: timestamp("date_of_birth"),
  address: text("address"),
  emergency_contact: text("emergency_contact"),
  pan_number: text("pan_number"),
  status: text("status").default("active"),
  joining_date: timestamp("joining_date"),
  organisation_id: varchar("organisation_id"),
  department_id: varchar("department_id"),
  designation_id: varchar("designation_id"),
  shift_id: varchar("shift_id"),
  bank_details: json("bank_details"),
  role_id: varchar("role_id"),
  active_flag: boolean("active_flag").default(true),
  delete_flag: boolean("delete_flag").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const departments = pgTable("departments", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  organisation_id: varchar("organisation_id").notNull(),
  active_flag: boolean("active_flag").default(true),
  delete_flag: boolean("delete_flag").default(false),
  created_at: timestamp("created_at").defaultNow(),
  modified_at: timestamp("modified_at").defaultNow(),
  created_by: varchar("created_by"),
  modified_by: varchar("modified_by"),
});

export const designations = pgTable("designations", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  organisation_id: varchar("organisation_id").notNull(),
  active_flag: boolean("active_flag").default(true),
  delete_flag: boolean("delete_flag").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const shifts = pgTable("shifts", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  start: text("start").notNull(),
  end: text("end").notNull(),
  grace_minutes: integer("grace_minutes").default(0),
  organisation_id: varchar("organisation_id").notNull(),
  active_flag: boolean("active_flag").default(true),
  delete_flag: boolean("delete_flag").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const leaves = pgTable("leaves", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  description: text("description"),
  color: text("color"),
  icon: text("icon"),
  organisation_id: varchar("organisation_id").notNull(),
  category: text("category"),
  accrual_method: text("accrual_method"),
  accrual_rate: integer("accrual_rate").default(0),
  initial_balance: integer("initial_balance").default(0),
  max_balance: integer("max_balance"),
  min_balance: integer("min_balance").default(0),
  allow_carry_forward: boolean("allow_carry_forward").default(false),
  carry_forward_limit: integer("carry_forward_limit"),
  carry_forward_expiry_months: integer("carry_forward_expiry_months"),
  allow_encashment: boolean("allow_encashment").default(false),
  encashment_rate: integer("encashment_rate"),
  requires_approval: boolean("requires_approval").default(true),
  requires_documentation: boolean("requires_documentation").default(false),
  required_documents: json("required_documents"),
  auto_approve_for_days: integer("auto_approve_for_days"),
  approval_levels: text("approval_levels"),
  min_service_months: integer("min_service_months").default(0),
  min_advance_notice_days: integer("min_advance_notice_days").default(0),
  max_consecutive_days: integer("max_consecutive_days"),
  blackout_dates: json("blackout_dates"),
  active_flag: boolean("active_flag").default(true),
  delete_flag: boolean("delete_flag").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const leaveRequests = pgTable("leave_requests", {
  id: varchar("id").primaryKey(),
  employee_id: varchar("employee_id").notNull(),
  leave_id: varchar("leave_id").notNull(),
  organisation_id: varchar("organisation_id").notNull(),
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date").notNull(),
  total_days: integer("total_days").notNull(),
  reason: text("reason"),
  comments: text("comments"),
  status: text("status").default("pending"),
  is_half_day: boolean("is_half_day").default(false),
  work_handover_to: varchar("work_handover_to"),
  handover_notes: text("handover_notes"),
  emergency_contact_name: text("emergency_contact_name"),
  emergency_contact_phone: text("emergency_contact_phone"),
  approver_comments: text("approver_comments"),
  approved_at: timestamp("approved_at"),
  rejected_at: timestamp("rejected_at"),
  attachments: json("attachments").$type<any[]>(),
  approvals: json("approvals").$type<any[]>(),
  active_flag: boolean("active_flag").default(true),
  delete_flag: boolean("delete_flag").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const roles = pgTable("roles", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  organisation_id: varchar("organisation_id"),
  active_flag: boolean("active_flag").default(true),
  delete_flag: boolean("delete_flag").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const permissions = pgTable("permissions", {
  id: varchar("id").primaryKey(),
  resource: text("resource").notNull(),
  actions: json("actions").$type<string[]>().notNull(),
  description: text("description"),
  organisation_id: varchar("organisation_id"),
  active_flag: boolean("active_flag").default(true),
  delete_flag: boolean("delete_flag").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
  active_flag: true,
  delete_flag: true,
  created_at: true,
  updated_at: true,
});

export const insertOrganisationSchema = createInsertSchema(organisations).omit({
  id: true,
  active_flag: true,
  delete_flag: true,
  created_at: true,
  updated_at: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  active_flag: true,
  delete_flag: true,
  created_at: true,
  updated_at: true,
});

export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
  active_flag: true,
  delete_flag: true,
  created_at: true,
  updated_at: true,
});

export const insertDesignationSchema = createInsertSchema(designations).omit({
  id: true,
  active_flag: true,
  delete_flag: true,
  created_at: true,
  updated_at: true,
});

export const insertShiftSchema = createInsertSchema(shifts).omit({
  id: true,
  active_flag: true,
  delete_flag: true,
  created_at: true,
  updated_at: true,
});

export const insertLeaveSchema = createInsertSchema(leaves).omit({
  id: true,
  active_flag: true,
  delete_flag: true,
  created_at: true,
  updated_at: true,
});

export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({
  id: true,
  active_flag: true,
  delete_flag: true,
  created_at: true,
  updated_at: true,
});

export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  active_flag: true,
  delete_flag: true,
  created_at: true,
  updated_at: true,
});

export const insertPermissionSchema = createInsertSchema(permissions).omit({
  id: true,
  active_flag: true,
  delete_flag: true,
  created_at: true,
  updated_at: true,
});

// Types
export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;

export type Organisation = typeof organisations.$inferSelect;
export type InsertOrganisation = z.infer<typeof insertOrganisationSchema>;

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;

export type Designation = typeof designations.$inferSelect;
export type InsertDesignation = z.infer<typeof insertDesignationSchema>;

export type Shift = typeof shifts.$inferSelect;
export type InsertShift = z.infer<typeof insertShiftSchema>;

export type Leave = typeof leaves.$inferSelect;
export type InsertLeave = z.infer<typeof insertLeaveSchema>;

export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;

export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;

export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;

// Extended types for employees with included relations
export interface EmployeeWithDepartment extends Employee {
  department?: Department;
}

export interface EmployeeWithDesignation extends Employee {
  designation?: Designation;
}

export interface EmployeeWithRelations extends Employee {
  department?: Department;
  designation?: Designation;
}
