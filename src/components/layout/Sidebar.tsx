import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  MdDashboard,
  MdAddCircle,
  MdListAlt,
  MdHistory,
  MdAnalytics,
  MdPerson,
  MdExitToApp,
} from 'react-icons/md';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentRole } = useApp();

  const getLinks = () => {
    switch (currentRole) {
      case 'STUDENT':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: MdDashboard },
          { name: 'Apply OD', path: '/student/apply', icon: MdAddCircle },
          { name: 'My Requests', path: '/student/requests', icon: MdListAlt },
          { name: 'History', path: '/student/history', icon: MdHistory },
          { name: 'Profile', path: '/profile', icon: MdPerson },
        ];
      case 'MENTOR':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: MdDashboard },
          { name: 'Pending Approvals', path: '/mentor/pending', icon: MdListAlt },
          { name: 'History', path: '/mentor/history', icon: MdHistory },
          { name: 'Profile', path: '/profile', icon: MdPerson },
        ];
      case 'HOD':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: MdDashboard },
          { name: 'Pending Approvals', path: '/hod/pending', icon: MdListAlt },
          { name: 'Approved History', path: '/hod/history', icon: MdHistory },
          { name: 'Analytics', path: '/analytics', icon: MdAnalytics },
          { name: 'Profile', path: '/profile', icon: MdPerson },
        ];
      default:
        return [{ name: 'Dashboard', path: '/dashboard', icon: MdDashboard }];
    }
  };

  const links = getLinks();

  const activeStyle = 'flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400';
  const inactiveStyle = 'flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg text-gray-650 hover:bg-gray-50 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200 transition-all';

  return (
    <>
      {/* Mobile drawer backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar navigation container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 pt-16 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {link.name}
              </NavLink>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-gray-150 dark:border-zinc-800">
          <NavLink
            to="/"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg text-red-650 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/20 transition-all w-full text-left"
          >
            <MdExitToApp className="h-5 w-5" />
            Sign Out
          </NavLink>
        </div>
      </aside>
    </>
  );
};
