import { useState, useEffect } from 'react';
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
  ChevronDown,
  ChevronRight,
  UserCheck,
  CalendarDays,
  Shield,
  Cog,
  DollarSign,
  RotateCcw,
  Calculator,
  PartyPopper
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

// Navigation structure with main modules and sub-modules
const navigationModules = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    href: 'dashboard',
    icon: BarChart3,
    roles: ['admin', 'employee'],
    isMainModule: true
  },
  {
    id: 'master',
    name: 'Master',
    icon: Settings,
    roles: ['admin', 'hr_manager'],
    isMainModule: true,
    subModules: [
      { name: 'Organization Management', href: 'organization', icon: Globe },
      { name: 'Department', href: 'departments', icon: Building },
      { name: 'Shift', href: 'shifts', icon: Clock },
      { name: 'Attendance Policies', href: 'attendance-policies', icon: CalendarCheck },
      { name: 'Work Day Rules', href: 'work-day-rules', icon: CalendarDays },
      { name: 'Leave Management', href: 'leave-management', icon: Calendar },
      { name: 'Holidays', href: 'holidays', icon: PartyPopper },
      { name: 'Salary Component Types', href: 'salary-component-types', icon: Settings }
    ]
  },
  {
    id: 'employee-management',
    name: 'Employee Management',
    href: 'employees',
    icon: Users,
    roles: ['admin', 'hr_manager'],
    isMainModule: true
  },
  {
    id: 'payroll',
    name: 'Payroll',
    icon: DollarSign,
    roles: ['admin', 'hr_manager'],
    isMainModule: true,
    subModules: [
      { name: 'Payroll Cycle', href: 'payroll-cycle', icon: RotateCcw },
      { name: 'Payroll', href: 'payroll', icon: Calculator }
    ]
  },
  // { name: 'Payroll', href: 'payroll', icon: DollarSign, section: 'Payroll', roles: ['admin', 'hr_manager'] },
  {
    id: 'attendance',
    name: 'Attendance',
    icon: Clock,
    roles: ['admin', 'hr_manager', 'employee'],
    isMainModule: true,
    subModules: [
      { name: "Today's Attendance", href: 'attendance/today', icon: Calendar },
      { name: 'Monthly Attendance', href: 'attendance', icon: UserCheck }
    ]
  },
  {
    id: 'leaves',
    name: 'Leaves',
    icon: Calendar,
    roles: ['admin', 'hr_manager', 'employee'],
    isMainModule: true,
    subModules: [
      { name: 'Leave Requests', href: 'leave-requests', icon: CalendarCheck }
    ]
  },
  {
    id: 'administration',
    name: 'Administration',
    icon: Shield,
    roles: ['admin'],
    isMainModule: true,
    subModules: [
      { name: 'Roles & Permissions', href: 'roles', icon: ShieldQuestion },
      { name: 'Settings', href: 'settings', icon: Cog }
    ]
  }
];

export function Sidebar({ open, setOpen }: SidebarProps) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [expandedModules, setExpandedModules] = useState<string[]>(['dashboard']);

  // Auto-expand modules based on current route
  useEffect(() => {
    const modulesToExpand = ['dashboard'];
    
    // Auto-expand master if on any master route
    if (pathname.startsWith('/admin/organization') || 
        pathname.startsWith('/admin/departments') || 
        pathname.startsWith('/admin/shifts') || 
        pathname.startsWith('/admin/attendance-policies') ||
        pathname.startsWith('/admin/work-day-rules') ||
        pathname.startsWith('/admin/leave-management') ||
        pathname.startsWith('/admin/salary-component-types')) {
      modulesToExpand.push('master');
    }
    
    // Employee Management is now a direct link, no need to expand
    
    // Auto-expand payroll if on any payroll route
    if (pathname.startsWith('/admin/payroll-cycle') || pathname.startsWith('/admin/payroll')) {
      modulesToExpand.push('payroll');
    }
    
    // Auto-expand attendance if on attendance route
    if (pathname.startsWith('/admin/attendance')) {
      modulesToExpand.push('attendance');
    }
    
    // Auto-expand leaves if on leave requests route
    if (pathname.startsWith('/admin/leave-requests')) {
      modulesToExpand.push('leaves');
    }
    
    // Auto-expand administration if on any admin route
    if (pathname.startsWith('/admin/roles') || pathname.startsWith('/admin/settings')) {
      modulesToExpand.push('administration');
    }
    
    setExpandedModules(prev => {
      const newModules = [...new Set([...prev, ...modulesToExpand])];
      return newModules;
    });
  }, [pathname]);

  const basePath = user?.role === 'admin' ? '/admin' : '/employee';

  const canAccessModule = (module: any) => {
    if (!module.roles) return true;
    return module.roles.includes(user?.role || '');
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const isModuleActive = (module: any) => {
    // Only check if module itself is active, not sub-modules
    if (module.href) {
      const modulePath = `${basePath}/${module.href}`;
      // For employee management, also check if we're on detail/edit pages
      if (module.id === 'employee-management') {
        return pathname === modulePath || pathname.startsWith(`${modulePath}/`);
      }
      return pathname === modulePath;
    }
    // If module has sub-modules, don't mark it as active based on sub-module selection
    // This prevents the main nav item from being highlighted when a sub-item is selected
    return false;
  };

  const isSubModuleActive = (subModule: any) => {
    const fullPath = `${basePath}/${subModule.href}`;
    // For "attendance" route, only match exact path to avoid matching "attendance/today"
    if (subModule.href === 'attendance') {
      return pathname === fullPath;
    }
    // For other routes, allow exact match or sub-routes
    return pathname === fullPath || pathname.startsWith(`${fullPath}/`);
  };

  return (
    <>
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-[#0B2E5C] border-r border-white/10 transform transition-all duration-300 ease-in-out lg:translate-x-0 shadow-2xl flex flex-col h-full",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-3 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">
                OneHR
              </span>
              <p className="text-xs text-white/70">HR Management</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/20 transition-all duration-200"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden mt-6 px-2 space-y-3 pb-4">
          {navigationModules.filter(canAccessModule).map((module) => {
            const Icon = module.icon;
            const isExpanded = expandedModules.includes(module.id);
            const isActive = isModuleActive(module);

            return (
              <div key={module.id} className="space-y-2 mb-2">
                {/* Module with sub-modules - use Collapsible */}
                {module.subModules ? (
                  <Collapsible
                    open={isExpanded}
                    onOpenChange={() => toggleModule(module.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <button
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
                          isActive
                            ? "bg-white text-[#0B2E5C] shadow-lg"
                            : "text-white hover:bg-white hover:text-[#0B2E5C] border border-transparent"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={cn(
                            "p-1.5 rounded-md transition-all duration-200",
                            isActive
                              ? "bg-[#0B2E5C]/10 text-[#0B2E5C]"
                              : "text-white group-hover:text-[#0B2E5C]"
                          )}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="font-semibold">{module.name}</span>
                        </div>
                        <div className="p-1 rounded-md">
                          {isExpanded ? (
                            <ChevronDown className={cn(
                              "h-4 w-4 transition-colors",
                              isActive ? "text-[#0B2E5C]" : "text-white group-hover:text-[#0B2E5C]"
                            )} />
                          ) : (
                            <ChevronRight className={cn(
                              "h-4 w-4 transition-colors",
                              isActive ? "text-[#0B2E5C]" : "text-white group-hover:text-[#0B2E5C]"
                            )} />
                          )}
                        </div>
                      </button>
                    </CollapsibleTrigger>

                    {/* Sub Modules */}
                    <CollapsibleContent className="space-y-3 mt-2">
                      {module.subModules.map((subModule) => {
                        const isSubActive = isSubModuleActive(subModule);

                        return (
                          <NavLink 
                            key={subModule.name} 
                            to={`${basePath}/${subModule.href}`} 
                            onClick={() => setOpen(false)}
                          >
                            <div
                              className={cn(
                                "flex items-center px-3 py-2.5 ml-8 text-sm rounded-lg transition-all duration-200 group mb-1",
                                isSubActive
                                  ? "bg-white text-[#0B2E5C] shadow-md"
                                  : "text-white hover:bg-white hover:text-[#0B2E5C] border border-transparent"
                              )}
                            >
                              <span className="font-medium">{subModule.name}</span>
                            </div>
                          </NavLink>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  /* Module without sub-modules - direct NavLink */
                  <NavLink to={`${basePath}/${module.href}`} onClick={() => setOpen(false)}>
                    <div
                      className={cn(
                        "flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
                        isActive
                          ? "bg-white text-[#0B2E5C] shadow-lg"
                          : "text-white hover:bg-white hover:text-[#0B2E5C] border border-transparent"
                      )}
                    >
                      <div className={cn(
                        "p-1.5 rounded-md transition-all duration-200",
                        isActive
                          ? "bg-[#0B2E5C]/10 text-[#0B2E5C]"
                          : "text-white group-hover:text-[#0B2E5C]"
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="font-semibold">{module.name}</span>
                    </div>
                  </NavLink>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer - Fixed at bottom */}
        <div className="flex-shrink-0 p-2 border-t border-white/10 bg-[#0B2E5C]">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/10 border border-white/10">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <UserCheck className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-white/70 capitalize">
                {user?.role || 'employee'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
