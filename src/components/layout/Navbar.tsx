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
    <header className="sticky top-0 z-40 bg-fx-blue h-16 w-full flex items-center justify-between px-4 sm:px-6 shadow-sm">
      {/* Left side: Hamburger & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-lg text-white/90 hover:bg-white/10 focus:outline-none transition-colors cursor-pointer"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <FaGraduationCap className="h-8 w-8 text-white hidden md:block" />
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white leading-tight m-0 uppercase">
              FRANCIS XAVIER ENGINEERING COLLEGE
            </h1>
            <span className="text-[10px] text-white/80 font-medium tracking-wide block uppercase">
              OD System Profile
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Role Switcher & User Profile */}
      <div className="flex items-center gap-4">
        {/* Role Switcher Widget */}
        <div className="flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-lg border border-white/20 shadow-inner">
          <label htmlFor="role-select" className="text-xs font-semibold text-white/70">
            Role:
          </label>
          <select
            id="role-select"
            value={currentRole}
            onChange={handleRoleChange}
            className="text-xs font-bold text-white bg-transparent border-none outline-none focus:ring-0 cursor-pointer"
          >
            <option value="STUDENT" className="text-gray-900">Student</option>
            <option value="MENTOR" className="text-gray-900">Mentor</option>
            <option value="HOD" className="text-gray-900">HOD</option>
            <option value="ADMIN" className="text-gray-900">Admin</option>
          </select>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-2 border-l border-white/20 pl-4">
          <FaUserCircle className="h-6 w-6 text-white" />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-white">
              {currentRole === 'STUDENT'
                ? 'SAM JEYASEELAN A'
                : currentRole === 'MENTOR'
                ? 'Dr. MANOHAR E'
                : currentRole === 'HOD'
                ? 'HOD CSE'
                : 'PRINCIPAL'}
            </p>
            <p className="text-[10px] text-white/80 font-medium uppercase">{currentRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
