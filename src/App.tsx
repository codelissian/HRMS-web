import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ShiftsProvider } from "@/contexts/ShiftsContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import LandingPage from "@/pages/LandingPage";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import EmployeeList from "@/pages/employees/EmployeeList";
import EmployeeDetail from "@/pages/employees/EmployeeDetail";
import EmployeeFormPage from "@/pages/employees/EmployeeFormPage";
import DepartmentList from "@/pages/departments/DepartmentList";
import { ShiftsPage } from "@/pages/shifts";
import { AttendanceAndWorkDayRulePage } from "@/pages/attendance-and-work-day-rule";
import { AttendanceManagementPage, TodaysAttendancePage } from "@/pages/attendance";
import { LeaveManagementPage } from "@/pages/leave-management";
import { LeaveRequestsPage } from "@/pages/leave-requests";
import { OrganizationPage } from "@/pages/organization";
import CreateAttendancePolicyPage from "@/pages/attendance-policies/CreateAttendancePolicyPage";
import { PayrollPage } from "@/pages/payroll";
import { PayrollCyclePage } from "@/pages/payroll-cycle";
import { SalaryComponentTypesPage } from "@/pages/salary-component-types";
import HolidayList from "@/pages/holidays/HolidayList";
import HolidayDetail from "@/pages/holidays/HolidayDetail";
import NotFound from "@/pages/not-found";
import EmployeeLayout from "@/employee/layout/EmployeeLayout";
import EmployeeDashboard from "@/employee/pages/Dashboard";
import EmployeeLeaveRequests from "@/employee/pages/LeaveRequests";
import EmployeeProfile from "@/employee/pages/Profile";
import VerifyEmail from "@/pages/VerifyEmail";
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Create Material-UI theme that matches your design
const muiTheme = createTheme({
  typography: {
    fontFamily: '"Public Sans", sans-serif',
  },
  palette: {
    primary: {
      main: '#3b82f6', // Blue color to match your design
    },
    background: {
      default: 'transparent',
      paper: 'transparent',
    },
    text: {
      primary: '#374151',
      secondary: '#6b7280',
    },
    divider: '#e5e7eb',
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'transparent',
          },
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
});

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="organization" element={<OrganizationPage />} />
        <Route path="employees" element={<EmployeeList />} />
        <Route path="employees/new" element={<EmployeeFormPage />} />
        <Route path="employees/:id" element={<EmployeeDetail />} />
        <Route path="employees/:id/edit" element={<EmployeeFormPage />} />
        <Route path="departments" element={<DepartmentList />} />
        <Route path="shifts" element={<ShiftsPage />} />
        <Route path="attendance-and-work-day-rule" element={<AttendanceAndWorkDayRulePage />} />
        <Route path="attendance-policies/create" element={<CreateAttendancePolicyPage />} />
        <Route path="attendance-policies/:id/edit" element={<CreateAttendancePolicyPage />} />
        <Route path="attendance/today" element={<TodaysAttendancePage />} />
        <Route path="attendance" element={<AttendanceManagementPage />} />
        <Route path="leave-requests" element={<LeaveRequestsPage />} />
        <Route path="leave-management" element={<LeaveManagementPage />} />
        <Route path="holidays" element={<HolidayList />} />
        <Route path="holidays/:id" element={<HolidayDetail />} />
        <Route path="salary-component-types" element={<SalaryComponentTypesPage />} />
        <Route path="payroll-cycle" element={<PayrollCyclePage />} />
        <Route path="payroll" element={<PayrollPage />} />
        <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      {/* Employee routes */}
      <Route
        path="/employee"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <EmployeeLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<EmployeeDashboard />} />
        <Route path="leave-requests" element={<EmployeeLeaveRequests />} />
        <Route path="profile" element={<EmployeeProfile />} />
        <Route path="" element={<Navigate to="/employee/dashboard" replace />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ShiftsProvider>
            <MuiThemeProvider theme={muiTheme}>
              <CssBaseline />
              <TooltipProvider>
                <Toaster />
                <Router>
                  <AppRoutes />
                </Router>
              </TooltipProvider>
            </MuiThemeProvider>
          </ShiftsProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
