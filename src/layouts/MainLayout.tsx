import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { X } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen((prev) => !prev);
  };

  const closeMobileDrawer = () => {
    setMobileDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#0F172A] text-[#1F2937] dark:text-[#F9FAFB] flex flex-col font-sans">
      {/* Institutional Navbar */}
      <Navbar onToggleMobileDrawer={toggleMobileDrawer} />

      {/* Main Layout Container */}
      <div className="flex-1 flex relative">
        {/* Desktop Permanent Sidebar */}
        <Sidebar />

        {/* Mobile Slide-out Navigation Drawer */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop Overlay */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={closeMobileDrawer}
            />

            {/* Slide-out Drawer Panel */}
            <div className="relative z-10 w-72 max-w-[80vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
              <button
                onClick={closeMobileDrawer}
                className="absolute top-3 right-3 p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close Menu"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <Sidebar onNavigate={closeMobileDrawer} isMobileDrawer />
            </div>
          </div>
        )}

        {/* Scrollable Content Area */}
        <main className="flex-1 p-3.5 sm:p-5 lg:p-6 max-w-7xl mx-auto w-full min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
