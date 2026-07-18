import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';

export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen text-gray-900 flex flex-col">
      {/* Top Navbar */}
      <Navbar onToggleSidebar={toggleSidebar} />

      {/* Main container with Sidebar + Content */}
      <div className="flex-1 flex pt-0">
        {/* Navigation Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        {/* Primary Page Content Wrapper */}
        <main className="flex-1 min-h-[calc(100vh-4rem)] p-4 sm:p-6 transition-all duration-300">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
