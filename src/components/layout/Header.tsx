import { Menu, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getPageTitle = () => {
    const path = location.pathname;
    
    // Admin routes
    if (path.startsWith('/admin')) {
      if (path === '/admin/dashboard') return 'Dashboard';
      if (path === '/admin/employees') return 'Employee Management';
      if (path === '/admin/employees/new') return 'Add New Employee';
      if (path.includes('/admin/employees/') && path.includes('/edit')) return 'Edit Employee';
      if (path.startsWith('/admin/employees/') && !path.includes('/edit')) return 'Employee Details';
      if (path === '/admin/departments') return 'Department Management';
      if (path === '/admin/shifts') return 'Shift Management';
      if (path === '/admin/attendance-policies') return 'Attendance Policies';
      if (path === '/admin/attendance-policies/create') return 'Create Attendance Policy';
      if (path.includes('/admin/attendance-policies/') && path.includes('/edit')) return 'Edit Attendance Policy';
      if (path === '/admin/work-day-rules') return 'Work Day Rules';
      if (path === '/admin/attendance') return 'Attendance Management';
      if (path === '/admin/leave-requests') return 'Leave Requests';
      if (path === '/admin/leave-management') return 'Leave Management';
      if (path === '/admin/organization') return 'Organization';
      if (path === '/admin/holidays') return 'Holidays';
      if (path === '/admin/salary-component-types') return 'Salary Component Types';
      if (path === '/admin/payroll') return 'Payroll Management';
      if (path === '/admin/payroll-cycle') return 'Payroll Cycle Management';
    }
    
    // Employee routes
    if (path.startsWith('/employee')) {
      if (path === '/employee/dashboard') return 'Dashboard';
      if (path === '/employee/attendance-policies') return 'Attendance Policies';
      if (path === '/employee/leave-requests') return 'Leave Requests';
    }
    
    return 'Dashboard';
  };

  const getPageDescription = () => {
    const path = location.pathname;
    
    // Admin routes
    if (path.startsWith('/admin')) {
      if (path === '/admin/dashboard') return `Welcome back, ${user?.name}`;
      if (path === '/admin/employees') return 'Manage employee information and details';
      if (path === '/admin/employees/new') return 'Fill in the employee details below';
      if (path.includes('/admin/employees/') && path.includes('/edit')) return 'Update the employee details below';
      if (path.startsWith('/admin/employees/') && !path.includes('/edit')) return 'View and edit employee details';
      if (path === '/admin/departments') return 'Manage departments and designations';
      if (path === '/admin/shifts') return 'Configure work shifts and schedules';
      if (path === '/admin/attendance-policies') return 'Set attendance rules and policies';
      if (path === '/admin/attendance-policies/create') return 'Configure attendance tracking rules and policies for your organization';
      if (path.includes('/admin/attendance-policies/') && path.includes('/edit')) return 'Update attendance tracking rules and policies for your organization';
      if (path === '/admin/work-day-rules') return 'Manage work day rules for your organization';
      if (path === '/admin/attendance') return 'Monitor employee attendance and statistics';
      if (path === '/admin/leave-requests') return 'Review and manage leave requests';
      if (path === '/admin/leave-management') return 'Configure leave types and policies';
      if (path === '/admin/organization') return 'Manage your organization settings and details';
      if (path === '/admin/holidays') return 'Manage organization holidays';
      if (path === '/admin/salary-component-types') return 'Manage salary component types for your payroll system';
      if (path === '/admin/payroll-cycle') return 'Manage payroll cycles, define pay periods, and schedule payroll processing';
    }
    
    // Employee routes
    if (path.startsWith('/employee')) {
      if (path === '/employee/dashboard') return `Welcome back, ${user?.name}`;
      if (path === '/employee/attendance-policies') return 'View attendance policies and rules';
      if (path === '/employee/leave-requests') return 'Manage your leave requests';
    }
    
    return `Welcome back, ${user?.name}`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden mr-4"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* Back Button for Employee Details and Forms */}
        {location.pathname.startsWith('/admin/employees/') && location.pathname !== '/admin/employees' && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/employees')}
            className="mr-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}

        {/* Back Button for Attendance Policies Create */}
        {location.pathname === '/admin/attendance-policies/create' && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/attendance-policies')}
            className="mr-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}

        {/* Back Button for Attendance Policies Edit */}
        {location.pathname.includes('/admin/attendance-policies/') && location.pathname.includes('/edit') && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/attendance-policies')}
            className="mr-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {getPageTitle()}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {getPageDescription()}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-white">
                  {getInitials(user?.name || '')}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuItem onClick={logout}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
