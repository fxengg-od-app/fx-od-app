import React from 'react';
import { useApp } from '../../context/AppContext';
import type { UserRole } from '../../constants/roles';
import { FaUserCircle, FaGraduationCap } from 'react-icons/fa';

export const Navbar: React.FC<{ onToggleSidebar: () => void }> = ({ onToggleSidebar }) => {
  const { currentRole, setCurrentRole } = useApp();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentRole(e.target.value as UserRole);
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 h-16 w-full flex items-center justify-between px-4 sm:px-6">
      {/* Left side: Hamburger & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 md:hidden focus:outline-none"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <FaGraduationCap className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-zinc-100 leading-tight m-0">
              FX EC OD portal
            </h1>
            <span className="text-[10px] text-gray-500 font-medium tracking-wide block uppercase">
              Intra-college OD system
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Role Switcher & User Profile */}
      <div className="flex items-center gap-4">
        {/* Role Switcher Widget */}
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 px-3 py-1.5 rounded-lg">
          <label htmlFor="role-select" className="text-xs font-semibold text-gray-500 dark:text-zinc-400">
            Role:
          </label>
          <select
            id="role-select"
            value={currentRole}
            onChange={handleRoleChange}
            className="text-xs font-bold text-gray-800 dark:text-zinc-200 bg-transparent border-none outline-none focus:ring-0 cursor-pointer"
          >
            <option value="STUDENT" className="dark:bg-zinc-900">Student</option>
            <option value="MENTOR" className="dark:bg-zinc-900">Mentor</option>
            <option value="HOD" className="dark:bg-zinc-900">HOD</option>
          </select>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-2 border-l border-gray-100 dark:border-zinc-800 pl-4">
          <FaUserCircle className="h-6 w-6 text-gray-400" />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-gray-850 dark:text-zinc-200">
              {currentRole === 'STUDENT'
                ? 'Arun Kumar K'
                : currentRole === 'MENTOR'
                ? 'Mrs. R. Jeyanthi'
                : 'Dr. S. Premkumar'}
            </p>
            <p className="text-[10px] text-gray-400 font-medium uppercase">{currentRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
