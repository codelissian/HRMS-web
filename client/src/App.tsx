import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
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
import NotFound from "@/pages/not-found";
import VerifyEmail from "@/pages/VerifyEmail";

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
          <TooltipProvider>
            <Toaster />
            <Router>
              <AppRoutes />
            </Router>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
