// ============================================================
//  src/context/AppContext.tsx
//  Global application state.
//
//  ✅ Mock mode: all data managed locally (localStorage + in-memory)
//  🔄 Live mode: replace addRequest/updateStatus with odService calls
// ============================================================
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserRole } from '../constants/roles';
import { getCurrentUser } from '../services/authService';
import type { AuthUser } from '../services/authService';

// ── ODRequest type (matches backend schema) ──────────────────
export interface ODRequest {
  id: string;
  registerNumber: string;
  name: string;
  year: string;
  section: string;
  department: string;
  mentorName: string;
  dateType: 'SINGLE' | 'MULTIPLE';
  startDate: string;
  endDate?: string;
  description: string;
  facultyInCharge: string;
  odType: 'Applied Lab' | 'Individual';
  mentorStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  hodStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  finalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  appliedDate: string;
}

// ── Context type ─────────────────────────────────────────────
interface AppContextType {
  /** Currently active role (can be overridden in dev via Navbar) */
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;

  /** Authenticated user from authService — null when not logged in */
  currentUser: AuthUser | null;
  setCurrentUser: (user: AuthUser | null) => void;

  /** OD request list */
  requests: ODRequest[];
  addRequest: (request: Omit<ODRequest, 'id' | 'mentorStatus' | 'hodStatus' | 'finalStatus' | 'appliedDate'>) => void;
  updateMentorStatus: (id: string, status: 'APPROVED' | 'REJECTED', reason?: string) => void;
  updateHODStatus: (id: string, status: 'APPROVED' | 'REJECTED', reason?: string) => void;
  bulkHODApprove: (ids: string[]) => void;
  bulkHODReject: (ids: string[], reason: string) => void;
}

// ── Seed / demo data ─────────────────────────────────────────
const mockRequests: ODRequest[] = [
  {
    id: 'OD-1001', registerNumber: '951221104001',
    name: 'Arun Kumar K', year: 'III', section: 'A', department: 'CSE',
    mentorName: 'Dr. Manohar E', dateType: 'SINGLE', startDate: '2026-07-17',
    description: 'Smart India Hackathon 2026 Preliminary Round',
    facultyInCharge: 'Dr. S. Premkumar', odType: 'Individual',
    mentorStatus: 'APPROVED', hodStatus: 'PENDING', finalStatus: 'PENDING',
    appliedDate: '2026-07-16',
  },
  {
    id: 'OD-1002', registerNumber: '951221104045',
    name: 'Priya Dharshini M', year: 'III', section: 'B', department: 'CSE',
    mentorName: 'Dr. Manohar E', dateType: 'MULTIPLE',
    startDate: '2026-07-18', endDate: '2026-07-20',
    description: 'Paper Presentation at Anna University, Chennai',
    facultyInCharge: 'Mrs. R. Jeyanthi', odType: 'Individual',
    mentorStatus: 'PENDING', hodStatus: 'PENDING', finalStatus: 'PENDING',
    appliedDate: '2026-07-15',
  },
  {
    id: 'OD-1003', registerNumber: '951222106012',
    name: 'Harish R', year: 'II', section: 'A', department: 'ECE',
    mentorName: 'Mrs. P. Kavitha', dateType: 'SINGLE', startDate: '2026-07-17',
    description: 'IoT Workshop Hands-on Training',
    facultyInCharge: 'Dr. G. Rajkumar', odType: 'Applied Lab',
    mentorStatus: 'APPROVED', hodStatus: 'APPROVED', finalStatus: 'APPROVED',
    appliedDate: '2026-07-14',
  },
  {
    id: 'OD-1004', registerNumber: '951220105088',
    name: 'Sanjay P', year: 'IV', section: 'C', department: 'EEE',
    mentorName: 'Mr. K. Suresh', dateType: 'SINGLE', startDate: '2026-07-15',
    description: 'Symposium Technical Event Coordination',
    facultyInCharge: 'Mr. A. Albert', odType: 'Individual',
    mentorStatus: 'REJECTED', hodStatus: 'PENDING', finalStatus: 'REJECTED',
    rejectionReason: 'Low attendance in monthly review (below 75%)',
    appliedDate: '2026-07-14',
  },
  {
    id: 'OD-1005', registerNumber: '951223108022',
    name: 'Keerthana S', year: 'I', section: 'A', department: 'AIML',
    mentorName: 'Dr. L. Priya', dateType: 'SINGLE', startDate: '2026-07-18',
    description: 'National Level Coding Contest — HackerEarth',
    facultyInCharge: 'Mr. B. Naveen', odType: 'Individual',
    mentorStatus: 'APPROVED', hodStatus: 'APPROVED', finalStatus: 'APPROVED',
    appliedDate: '2026-07-17',
  },
  {
    id: 'OD-1006', registerNumber: '951221104099',
    name: 'Rahul Krishnan', year: 'III', section: 'A', department: 'CSE',
    mentorName: 'Dr. Manohar E', dateType: 'MULTIPLE',
    startDate: '2026-07-16', endDate: '2026-07-17',
    description: 'Inter-College Robotics Competition — NIT Trichy',
    facultyInCharge: 'Dr. S. Premkumar', odType: 'Applied Lab',
    mentorStatus: 'APPROVED', hodStatus: 'APPROVED', finalStatus: 'APPROVED',
    appliedDate: '2026-07-14',
  },
];

// ── Context & Provider ────────────────────────────────────────
const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('STUDENT');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getCurrentUser);

  const [requests, setRequests] = useState<ODRequest[]>(() => {
    const local = localStorage.getItem('od_requests');
    return local ? (JSON.parse(local) as ODRequest[]) : mockRequests;
  });

  // Sync role when user changes (login sets role from user.role)
  useEffect(() => {
    if (currentUser) setCurrentRole(currentUser.role);
  }, [currentUser]);

  // Persist requests locally (mock mode)
  useEffect(() => {
    localStorage.setItem('od_requests', JSON.stringify(requests));
  }, [requests]);

  // ── CRUD ─────────────────────────────────────────────────────
  const addRequest = (
    newReq: Omit<ODRequest, 'id' | 'mentorStatus' | 'hodStatus' | 'finalStatus' | 'appliedDate'>
  ) => {
    // TODO (live): replace body with await createRequest(newReq) from odService
    const req: ODRequest = {
      ...newReq,
      id: `OD-${Math.floor(1000 + Math.random() * 9000)}`,
      mentorStatus: 'PENDING',
      hodStatus: 'PENDING',
      finalStatus: 'PENDING',
      appliedDate: new Date().toISOString().split('T')[0],
    };
    setRequests((prev) => [req, ...prev]);
  };

  const updateMentorStatus = (id: string, status: 'APPROVED' | 'REJECTED', reason?: string) => {
    // TODO (live): await mentorUpdateStatus(id, { status, reason }) from odService
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id !== id) return req;
        const finalStatus =
          status === 'REJECTED' ? 'REJECTED'
          : req.hodStatus === 'APPROVED' ? 'APPROVED'
          : 'PENDING';
        return { ...req, mentorStatus: status, rejectionReason: reason ?? req.rejectionReason, finalStatus };
      })
    );
  };

  const updateHODStatus = (id: string, status: 'APPROVED' | 'REJECTED', reason?: string) => {
    // TODO (live): await hodUpdateStatus(id, { status, reason }) from odService
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id !== id) return req;
        const finalStatus =
          status === 'APPROVED' && req.mentorStatus === 'APPROVED' ? 'APPROVED'
          : status === 'REJECTED' ? 'REJECTED'
          : 'PENDING';
        return { ...req, hodStatus: status, rejectionReason: reason ?? req.rejectionReason, finalStatus };
      })
    );
  };

  const bulkHODApprove = (ids: string[]) => {
    // TODO (live): await bulkApprove(ids) from odService, then refetch
    setRequests((prev) =>
      prev.map((req) => {
        if (!ids.includes(req.id)) return req;
        if (req.mentorStatus !== 'APPROVED') return req;
        return { ...req, hodStatus: 'APPROVED', finalStatus: 'APPROVED' };
      })
    );
  };

  const bulkHODReject = (ids: string[], reason: string) => {
    // TODO (live): await bulkReject(ids, reason) from odService, then refetch
    setRequests((prev) =>
      prev.map((req) => {
        if (!ids.includes(req.id)) return req;
        return { ...req, hodStatus: 'REJECTED', finalStatus: 'REJECTED', rejectionReason: reason };
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentRole, setCurrentRole,
        currentUser, setCurrentUser,
        requests, addRequest,
        updateMentorStatus, updateHODStatus,
        bulkHODApprove, bulkHODReject,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
