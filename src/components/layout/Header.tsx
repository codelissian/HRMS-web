import { Bell, Menu, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    
    // Admin routes
    if (path.startsWith('/admin')) {
      if (path === '/admin/dashboard') return 'Dashboard';
      if (path === '/admin/employees') return 'Employee Management';
      if (path.startsWith('/admin/employees/')) return 'Employee Details';
      if (path === '/admin/departments') return 'Department Management';
      if (path === '/admin/shifts') return 'Shift Management';
      if (path === '/admin/attendance-policies') return 'Attendance Policies';
      if (path === '/admin/attendance') return 'Attendance Management';
      if (path === '/admin/leave-requests') return 'Leave Requests';
      if (path === '/admin/leave-management') return 'Leave Management';
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
      if (path.startsWith('/admin/employees/')) return 'View and edit employee details';
      if (path === '/admin/departments') return 'Manage departments and designations';
      if (path === '/admin/shifts') return 'Configure work shifts and schedules';
      if (path === '/admin/attendance-policies') return 'Set attendance rules and policies';
      if (path === '/admin/attendance') return 'Monitor employee attendance and statistics';
      if (path === '/admin/leave-requests') return 'Review and manage leave requests';
      if (path === '/admin/leave-management') return 'Configure leave types and policies';
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
    <header className="bg-white/80 dark:bg-gray-850/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden mr-4"
        >
          <Menu className="h-5 w-5" />
        </Button>
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
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        </Button>

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
