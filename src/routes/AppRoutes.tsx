import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Login } from '../pages/Login/Login';
import { Dashboard } from '../pages/Dashboard/Dashboard';
import { ApplyOD } from '../pages/Student/ApplyOD';
import { MyRequests } from '../pages/Student/MyRequests';
import { History as StudentHistory } from '../pages/Student/History';
import { PendingApprovals as MentorPending } from '../pages/Mentor/PendingApprovals';
import { MentorHistory } from '../pages/Mentor/History';
import { HODPendingApprovals as HODPending } from '../pages/HOD/PendingApprovals';
import { HODHistory } from '../pages/HOD/ApprovedHistory';
import { Analytics } from '../pages/Analytics/Analytics';
import { Profile } from '../pages/Profile/Profile';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/" element={<Login />} />

      {/* Authenticated/Dashboard Layout Group */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/student/apply" element={<ApplyOD />} />
        <Route path="/student/requests" element={<MyRequests />} />
        <Route path="/student/history" element={<StudentHistory />} />
        <Route path="/mentor/pending" element={<MentorPending />} />
        <Route path="/mentor/history" element={<MentorHistory />} />
        <Route path="/hod/pending" element={<HODPending />} />
        <Route path="/hod/history" element={<HODHistory />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Fallback Catch-All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
