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
  Cog
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
      { name: 'Leave Management', href: 'leave-management', icon: Calendar }
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
    id: 'attendance-leave',
    name: 'Attendance & Leave',
    icon: CalendarCheck,
    roles: ['admin', 'hr_manager', 'employee'],
    isMainModule: true,
    subModules: [
      { name: 'Attendance & Work Day Rule', href: 'attendance-and-work-day-rule', icon: CalendarCheck },
      { name: 'Leave Requests', href: 'leave-requests', icon: Calendar },
      { name: 'Attendance Management', href: 'attendance', icon: Clock }
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
        pathname.startsWith('/admin/leave-management')) {
      modulesToExpand.push('master');
    }
    
    // Employee Management is now a direct link, no need to expand
    
    // Auto-expand attendance-leave if on any attendance/leave route
    if (pathname.startsWith('/admin/attendance') || pathname.startsWith('/admin/leave-requests')) {
      modulesToExpand.push('attendance-leave');
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
    if (module.href) {
      return pathname === `${basePath}/${module.href}`;
    }
    if (module.subModules) {
      return module.subModules.some((sub: any) => 
        pathname === `${basePath}/${sub.href}` || pathname.startsWith(`${basePath}/${sub.href}/`)
      );
    }
    return false;
  };

  const isSubModuleActive = (subModule: any) => {
    return pathname === `${basePath}/${subModule.href}` || pathname.startsWith(`${basePath}/${subModule.href}/`);
  };

  return (
    <>
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl border-r border-white/20 dark:border-gray-700/30 transform transition-all duration-300 ease-in-out lg:translate-x-0 shadow-2xl",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header with glassmorphism */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/20 dark:border-gray-700/30 bg-white/5 dark:bg-gray-900/5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                OneHR
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">HR Management</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden p-2 rounded-lg bg-white/10 dark:bg-gray-800/10 hover:bg-white/20 dark:hover:bg-gray-800/20 transition-all duration-200"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Navigation with glassmorphism */}
        <nav className="mt-6 px-4 space-y-2">
          {navigationModules.filter(canAccessModule).map((module) => {
            const Icon = module.icon;
            const isExpanded = expandedModules.includes(module.id);
            const isActive = isModuleActive(module);

            return (
              <div key={module.id} className="space-y-1">
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
                            ? "bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-blue-700 dark:text-blue-300 shadow-lg backdrop-blur-sm border border-blue-200/30 dark:border-blue-700/30"
                            : "text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-800/20 hover:backdrop-blur-sm border border-transparent hover:border-white/20 dark:hover:border-gray-700/30"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={cn(
                            "p-1.5 rounded-md transition-all duration-200",
                            isActive
                              ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                              : "bg-gray-100/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 group-hover:bg-blue-500/10 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                          )}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="font-semibold">{module.name}</span>
                        </div>
                        <div className="p-1 rounded-md bg-white/10 dark:bg-gray-800/10">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          )}
                        </div>
                      </button>
                    </CollapsibleTrigger>

                    {/* Sub Modules */}
                    <CollapsibleContent className="space-y-1 mt-2">
                      {module.subModules.map((subModule) => {
                        const SubIcon = subModule.icon;
                        const isSubActive = isSubModuleActive(subModule);

                        return (
                          <NavLink 
                            key={subModule.name} 
                            to={`${basePath}/${subModule.href}`} 
                            onClick={() => setOpen(false)}
                          >
                            <div
                              className={cn(
                                "flex items-center space-x-2 px-3 py-2 ml-4 text-sm rounded-lg transition-all duration-200 group",
                                isSubActive
                                  ? "bg-gradient-to-r from-blue-500/15 to-purple-600/15 text-blue-700 dark:text-blue-300 shadow-md backdrop-blur-sm border border-blue-200/20 dark:border-blue-700/20"
                                  : "text-gray-600 dark:text-gray-300 hover:bg-white/15 dark:hover:bg-gray-800/15 hover:backdrop-blur-sm border border-transparent hover:border-white/10 dark:hover:border-gray-700/20"
                              )}
                            >
                              <div className={cn(
                                "p-1 rounded-sm transition-all duration-200",
                                isSubActive
                                  ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                                  : "bg-gray-100/30 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 group-hover:bg-blue-500/10 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                              )}>
                                <SubIcon className="h-3.5 w-3.5" />
                              </div>
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
                          ? "bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-blue-700 dark:text-blue-300 shadow-lg backdrop-blur-sm border border-blue-200/30 dark:border-blue-700/30"
                          : "text-gray-700 dark:text-gray-200 hover:bg-white/20 dark:hover:bg-gray-800/20 hover:backdrop-blur-sm border border-transparent hover:border-white/20 dark:hover:border-gray-700/30"
                      )}
                    >
                      <div className={cn(
                        "p-1.5 rounded-md transition-all duration-200",
                        isActive
                          ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                          : "bg-gray-100/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 group-hover:bg-blue-500/10 group-hover:text-blue-600 dark:group-hover:text-blue-400"
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

        {/* Footer with glassmorphism */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20 dark:border-gray-700/30 bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/10 dark:bg-gray-800/10 border border-white/20 dark:border-gray-700/30">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <UserCheck className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user?.role || 'employee'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
