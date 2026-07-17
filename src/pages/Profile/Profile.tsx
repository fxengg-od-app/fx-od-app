import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { FaUserCircle } from 'react-icons/fa';

export const Profile: React.FC = () => {
  const { currentRole } = useApp();

  const getProfileDetails = () => {
    switch (currentRole) {
      case 'STUDENT':
        return {
          name: 'Arun Kumar K',
          email: 'arunkumar.22cse@francisxavier.ac.in',
          department: 'Computer Science and Engineering',
          roleName: 'Student (III Year, Sec A)',
          register: '951221104001',
          classAdvisor: 'Mrs. R. Jeyanthi',
        };
      case 'MENTOR':
        return {
          name: 'Mrs. R. Jeyanthi',
          email: 'rjeyanthi@francisxavier.ac.in',
          department: 'Computer Science and Engineering',
          roleName: 'Assistant Professor & Mentor',
          register: 'EMP-CSE-324',
          classAdvisor: 'N/A',
        };
      case 'HOD':
        return {
          name: 'Dr. S. Premkumar',
          email: 'premkumar.cse@francisxavier.ac.in',
          department: 'Computer Science and Engineering',
          roleName: 'Professor & Head of Department (HOD)',
          register: 'EMP-CSE-102',
          classAdvisor: 'N/A',
        };
      default:
        return {
          name: 'Administrator',
          email: 'admin@francisxavier.ac.in',
          department: 'IT Operations',
          roleName: 'System Administrator',
          register: 'EMP-ADMIN-01',
          classAdvisor: 'N/A',
        };
    }
  };

  const profile = getProfileDetails();

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-left">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-zinc-100 m-0">
          User Profile
        </h1>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
          Your profile information is fetched from the college database directory.
        </p>
      </div>

      <Card className="p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-150 dark:border-zinc-800">
          <div className="text-blue-600 dark:text-blue-400">
            <FaUserCircle className="h-20 w-20" />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-150 m-0">
              {profile.name}
            </h2>
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1">
              {profile.roleName}
            </p>
            <span className="text-xs text-gray-400 dark:text-zinc-500 font-medium block mt-0.5">
              ID/Register: {profile.register}
            </span>
          </div>
        </div>

        <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
          <div>
            <span className="text-xs text-gray-450 dark:text-zinc-500 font-bold block uppercase tracking-wider">
              Email Address
            </span>
            <span className="text-gray-800 dark:text-zinc-200 font-semibold block mt-1">
              {profile.email}
            </span>
          </div>

          <div>
            <span className="text-xs text-gray-450 dark:text-zinc-500 font-bold block uppercase tracking-wider">
              Department
            </span>
            <span className="text-gray-800 dark:text-zinc-200 font-semibold block mt-1">
              {profile.department}
            </span>
          </div>

          {currentRole === 'STUDENT' && (
            <div>
              <span className="text-xs text-gray-450 dark:text-zinc-500 font-bold block uppercase tracking-wider">
                Class Mentor
              </span>
              <span className="text-gray-800 dark:text-zinc-200 font-semibold block mt-1">
                {profile.classAdvisor}
              </span>
            </div>
          )}

          <div>
            <span className="text-xs text-gray-450 dark:text-zinc-500 font-bold block uppercase tracking-wider">
              Access Scope
            </span>
            <span className="inline-flex items-center gap-1.5 text-green-700 dark:text-green-400 font-bold mt-1 text-xs px-2.5 py-0.5 rounded-full bg-green-50 dark:bg-green-950/20 border border-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Active Authorization
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
