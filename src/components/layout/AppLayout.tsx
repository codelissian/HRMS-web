import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Outlet } from 'react-router-dom';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Fixed Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      {/* Backdrop for mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main content area - positioned to account for fixed sidebar */}
      <div className="flex-1 flex flex-col lg:ml-72 min-w-0 bg-gray-50">
        {/* Header within main content area */}
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Scrollable main content */}
        <main className="flex-1 overflow-auto p-3 lg:p-4 animate-fade-in bg-gray-50">
          {children}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
