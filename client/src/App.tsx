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
import DepartmentList from "@/pages/departments/DepartmentList";
import LeaveRequestList from "@/pages/leaves/LeaveRequestList";
import CalendarPage from "@/pages/calendar/CalendarPage";
import { ShiftsPage } from "@/pages/shifts";
import NotFound from "@/pages/not-found";
import VerifyEmail from "@/pages/VerifyEmail";
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Create Material-UI theme that matches your design
const muiTheme = createTheme({
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
        <Route path="employees" element={<EmployeeList />} />
        <Route path="employees/:id" element={<EmployeeDetail />} />
        <Route path="departments" element={<DepartmentList />} />
        <Route path="shifts" element={<ShiftsPage />} />
        <Route path="leave-requests" element={<LeaveRequestList />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      {/* Employee routes */}
      <Route
        path="/employee"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="leave-requests" element={<LeaveRequestList />} />
        <Route path="calendar" element={<CalendarPage />} />
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
