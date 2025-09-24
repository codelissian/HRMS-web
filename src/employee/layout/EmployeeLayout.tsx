import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export default function EmployeeLayout() {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r p-4">
        <nav className="space-y-2">
          <NavLink to="/employee/dashboard" className={({ isActive }) => isActive ? 'font-semibold text-blue-600' : ''}>Dashboard</NavLink>
          <div>
            <NavLink to="/employee/leave-requests" className={({ isActive }) => isActive ? 'font-semibold text-blue-600' : ''}>Leave Requests</NavLink>
          </div>
          <div>
            <NavLink to="/employee/profile" className={({ isActive }) => isActive ? 'font-semibold text-blue-600' : ''}>Profile</NavLink>
          </div>
        </nav>
      </aside>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

