import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  BarChart3, 
  Building, 
  IdCard, 
  Clock, 
  CalendarCheck, 
  Calendar, 
  FileText, 
  ShieldQuestion, 
  Settings,
  X,
  Globe,
  DollarSign
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const baseNavigation = [
  { name: 'Dashboard', href: 'dashboard', icon: BarChart3, section: 'Dashboard' },
  { name: 'Employees', href: 'employees', icon: Users, section: 'Employee Management', roles: ['admin', 'hr_manager'] },
  { name: 'Departments', href: 'departments', icon: Building, section: 'Employee Management', roles: ['admin', 'hr_manager'] },
  { name: 'Shifts', href: 'shifts', icon: Clock, section: 'Employee Management', roles: ['admin', 'hr_manager'] },
                { name: 'Attendance and Work Day Rule', href: 'attendance-and-work-day-rule', icon: CalendarCheck, section: 'Attendance & Leave', roles: ['admin', 'hr_manager'] },
              { name: 'Leave Management', href: 'leave-management', icon: Settings, section: 'Attendance & Leave', roles: ['admin', 'hr_manager'] },
              { name: 'Leave Requests', href: 'leave-requests', icon: Calendar, section: 'Attendance & Leave' },
              { name: 'Attendance Management', href: 'attendance', icon: Clock, section: 'Attendance & Leave', roles: ['admin', 'hr_manager'] },
  { name: 'Payroll', href: 'payroll', icon: DollarSign, section: 'Payroll', roles: ['admin', 'hr_manager'] },
  { name: 'Roles & Permissions', href: 'roles', icon: ShieldQuestion, section: 'Administration', roles: ['admin'] },
  { name: 'Settings', href: 'settings', icon: Settings, section: 'Administration', roles: ['admin'] },
  { name: 'Organization', href: 'organization', icon: Globe, section: 'Organization', roles: ['admin'] },
];

export function Sidebar({ open, setOpen }: SidebarProps) {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const basePath = user?.role === 'admin' ? '/admin' : '/employee';
  const navigation = baseNavigation.map((item) => ({ ...item, href: `${basePath}/${item.href}` }));
  
  const sections = navigation.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, typeof navigation>);

  const canAccessItem = (item: typeof navigation[0]) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role || '');
  };

  return (
    <>
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white/95 dark:bg-gray-850/95 backdrop-blur-md border-r border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-in-out lg:translate-x-0 shadow-xl",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">OneHR</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          {Object.entries(sections).map(([sectionName, items]) => (
            <div key={sectionName} className="mb-4">
              <div className="flex items-center px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {sectionName}
              </div>
              {items.filter(canAccessItem).map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <NavLink key={item.name} to={item.href} onClick={() => setOpen(false)}>
                    <button
                      className={cn(
                        "w-full flex items-center px-3 py-2 mt-1 text-sm font-medium rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary shadow-md transform scale-105"
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:transform hover:scale-105"
                      )}
                    >
                      <Icon className="mr-3 h-5 w-5 text-gray-400" />
                      {item.name}
                    </button>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
