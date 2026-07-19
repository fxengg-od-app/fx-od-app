import React, { useState, useMemo } from 'react';
import {
  Pencil,
  Lock,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
} from 'lucide-react';
import type { UserProfile, UserRole, Department, ImportedUserRecord } from '../../types/user';
import { ROLE_LABELS } from '../../constants/roles';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';

import { Pagination } from '../common/Pagination';
import { UserCheck, AlertTriangle } from 'lucide-react';

export interface UnifiedUserRecord {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  department: Department;
  registerNumber?: string;
  year?: string;
  section?: string;
  mentorEmail?: string;
  mentorName?: string;
  isLinked: boolean;
  isActive: boolean;
  source: 'users' | 'imported_users';
  createdAt?: string;
  rawProfile?: UserProfile;
  rawRegistry?: ImportedUserRecord;
}

interface UserManagementTableProps {
  users: UserProfile[];
  registry: ImportedUserRecord[];
  mentors: UserProfile[];
  onUpdateUser: (uid: string, updates: Partial<UserProfile>) => void;
  onUpdateRegistry: (docId: string, updates: Partial<ImportedUserRecord>) => void;
  onSoftDeleteUser: (uid: string) => void;
  onDeleteRegistry: (docId: string) => void;
  onAssignMentor: (studentUid: string, mentor: UserProfile) => void;
}

type SortColumn =
  | 'displayName'
  | 'email'
  | 'role'
  | 'department'
  | 'registerNumber'
  | 'year'
  | 'section'
  | 'isLinked'
  | 'createdAt';

type RoleFilterType = 'ALL' | 'STUDENT' | 'STAFF' | 'MENTOR' | 'HOD' | 'ADMIN' | 'UNASSIGNED';

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  registry,
  mentors,
  onUpdateUser,
  onUpdateRegistry,
  onSoftDeleteUser,
  onDeleteRegistry,
  onAssignMentor,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilterType>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [sortColumn, setSortColumn] = useState<SortColumn>('displayName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [editingRecord, setEditingRecord] = useState<UnifiedUserRecord | null>(null);
  const [assigningStudent, setAssigningStudent] = useState<UnifiedUserRecord | null>(null);
  const [selectedMentorUid, setSelectedMentorUid] = useState<string>('');

  // Form states for editing modal
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('STUDENT');
  const [editDepartment, setEditDepartment] = useState<Department>('CSE');
  const [editRegNo, setEditRegNo] = useState('');
  const [editYear, setEditYear] = useState<'I' | 'II' | 'III' | 'IV' | ''>('III');
  const [editSection, setEditSection] = useState('A');
  const [editMentorEmail, setEditMentorEmail] = useState('');

  // 1. Combine `users` and `imported_users` into a unified list
  const unifiedList = useMemo(() => {
    const list: UnifiedUserRecord[] = [];
    const activeUserEmails = new Set<string>();

    users.forEach((u) => {
      activeUserEmails.add(u.email.toLowerCase());
      list.push({
        id: u.uid,
        email: u.email,
        displayName: u.displayName,
        role: u.role,
        department: u.department,
        registerNumber: u.registerNumber || '',
        year: u.year || '',
        section: u.section || '',
        mentorEmail: u.mentorEmail || '',
        mentorName: u.mentorName || '',
        isLinked: true,
        isActive: u.isActive,
        source: 'users',
        createdAt: typeof u.createdAt === 'string' ? u.createdAt : '',
        rawProfile: u,
      });
    });

    registry.forEach((r) => {
      if (!activeUserEmails.has(r.email.toLowerCase())) {
        list.push({
          id: r.id || r.email,
          email: r.email,
          displayName: r.displayName,
          role: r.role,
          department: r.department,
          registerNumber: r.registerNumber || '',
          year: r.year || '',
          section: r.section || '',
          mentorEmail: r.mentorEmail || '',
          isLinked: r.isLinked,
          isActive: true,
          source: 'imported_users',
          createdAt: typeof r.createdAt === 'string' ? r.createdAt : '',
          rawRegistry: r,
        });
      }
    });

    return list;
  }, [users, registry]);

  // 2. Real-time Multi-Field Search & Smart Role / Department Filtering
  const filteredList = useMemo(() => {
    return unifiedList.filter((item) => {
      // Role Filter
      if (roleFilter !== 'ALL') {
        if (roleFilter === 'STUDENT' && item.role !== 'STUDENT') return false;
        if (roleFilter === 'MENTOR' && item.role !== 'MENTOR') return false;
        if (roleFilter === 'HOD' && item.role !== 'HOD') return false;
        if (roleFilter === 'ADMIN' && !['SUPER_ADMIN', 'PRINCIPAL', 'ACADEMIC_COORDINATOR'].includes(item.role)) return false;
        if (roleFilter === 'STAFF' && item.role === 'STUDENT') return false;
        if (roleFilter === 'UNASSIGNED') {
          if (item.role !== 'STUDENT') return false;
          const hasMentor = item.mentorEmail && item.mentorEmail.trim() !== '' && item.mentorName !== 'Unassigned Mentor';
          if (hasMentor) return false;
        }
      }

      // Department Filter
      if (departmentFilter !== 'ALL' && item.department !== departmentFilter) {
        return false;
      }

      // Search Query
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      return (
        item.displayName.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.registerNumber?.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q) ||
        item.mentorEmail?.toLowerCase().includes(q) ||
        item.mentorName?.toLowerCase().includes(q) ||
        ROLE_LABELS[item.role]?.toLowerCase().includes(q)
      );
    });
  }, [unifiedList, roleFilter, departmentFilter, searchQuery]);

  // 3. Interactive Column Sorting
  const sortedList = useMemo(() => {
    return [...filteredList].sort((a, b) => {
      let valA: string | boolean = a[sortColumn] || '';
      let valB: string | boolean = b[sortColumn] || '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredList, sortColumn, sortDirection]);

  // 4. Paginated Slice
  const totalPages = Math.ceil(sortedList.length / pageSize) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedList.slice(start, start + pageSize);
  }, [sortedList, currentPage, pageSize]);

  // Reset page to 1 when filters change
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (role: RoleFilterType) => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  const handleDepartmentFilterChange = (dept: string) => {
    setDepartmentFilter(dept);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleSort = (col: SortColumn) => {
    if (sortColumn === col) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (col: SortColumn) => {
    if (sortColumn !== col) return <ArrowUpDown className="w-3 h-3 opacity-40 ml-1 inline" />;
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-[#0B426E] ml-1 inline" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#0B426E] ml-1 inline" />
    );
  };

  const openEditModal = (rec: UnifiedUserRecord) => {
    setEditingRecord(rec);
    setEditName(rec.displayName);
    setEditEmail(rec.email);
    setEditRole(rec.role);
    setEditDepartment(rec.department);
    setEditRegNo(rec.registerNumber || '');
    setEditYear((rec.year as any) || 'III');
    setEditSection(rec.section || 'A');
    setEditMentorEmail(rec.mentorEmail || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const updates = {
      displayName: editName,
      email: editEmail,
      role: editRole,
      department: editDepartment,
      registerNumber: editRegNo || undefined,
      year: editYear as any || undefined,
      section: editSection || undefined,
      mentorEmail: editMentorEmail || undefined,
    };

    if (editingRecord.source === 'users') {
      onUpdateUser(editingRecord.id, updates as Partial<UserProfile>);
    } else {
      onUpdateRegistry(editingRecord.id, updates as Partial<ImportedUserRecord>);
    }

    setEditingRecord(null);
  };

  const handleDelete = (rec: UnifiedUserRecord) => {
    if (rec.role === 'SUPER_ADMIN') {
      alert('This SUPER_ADMIN account is protected and cannot be deleted.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete/deactivate ${rec.displayName}?`)) {
      if (rec.source === 'users') {
        onSoftDeleteUser(rec.id);
      } else {
        onDeleteRegistry(rec.id);
      }
    }
  };

  const handleAssignMentorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningStudent || !selectedMentorUid) return;
    const selectedMentor = mentors.find((m) => m.uid === selectedMentorUid);
    if (!selectedMentor) return;

    onAssignMentor(assigningStudent.id, selectedMentor);
    setAssigningStudent(null);
    setSelectedMentorUid('');
  };

  const unassignedCount = useMemo(() => {
    return unifiedList.filter((item) => {
      if (item.role !== 'STUDENT') return false;
      return !item.mentorEmail || item.mentorEmail.trim() === '' || item.mentorName === 'Unassigned Mentor';
    }).length;
  }, [unifiedList]);

  return (
    <div className="space-y-3">
      {/* Search & Filter Header Control Bar */}
      <div className="p-3 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Realtime Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name, email, reg no, mentor..."
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-xs text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0B426E]"
            />
          </div>

          {/* Department Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Department:</span>
            <select
              value={departmentFilter}
              onChange={(e) => handleDepartmentFilterChange(e.target.value)}
              className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-2.5 py-1 text-xs text-gray-800 dark:text-gray-200 font-medium focus:outline-none focus:ring-1 focus:ring-[#0B426E] cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="MECH">MECH</option>
              <option value="CIVIL">CIVIL</option>
              <option value="IT">IT</option>
              <option value="AI_DS">AI_DS</option>
            </select>
          </div>
        </div>

        {/* Smart Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-gray-100 dark:border-gray-700/60 text-xs">
          {[
            { id: 'ALL', label: 'All Users', count: unifiedList.length },
            { id: 'STUDENT', label: 'Students', count: unifiedList.filter((u) => u.role === 'STUDENT').length },
            { id: 'STAFF', label: 'Staff / Faculty', count: unifiedList.filter((u) => u.role !== 'STUDENT').length },
            { id: 'MENTOR', label: 'Mentors', count: unifiedList.filter((u) => u.role === 'MENTOR').length },
            { id: 'HOD', label: 'HODs', count: unifiedList.filter((u) => u.role === 'HOD').length },
            { id: 'ADMIN', label: 'Admins', count: unifiedList.filter((u) => ['SUPER_ADMIN', 'PRINCIPAL', 'ACADEMIC_COORDINATOR'].includes(u.role)).length },
            { id: 'UNASSIGNED', label: 'Unassigned Mentor', count: unassignedCount, isAlert: unassignedCount > 0 },
          ].map((pill) => {
            const isSelected = roleFilter === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => handleRoleFilterChange(pill.id as RoleFilterType)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#0B426E] text-white shadow-xs'
                    : pill.isAlert
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 hover:bg-amber-100'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span>{pill.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : pill.isAlert
                      ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-200'
                  }`}
                >
                  {pill.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Sortable Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 uppercase font-semibold text-[11px] tracking-wider select-none">
              <th className="p-3 cursor-pointer hover:text-gray-900 dark:hover:text-white" onClick={() => handleSort('displayName')}>
                Full Name {renderSortIcon('displayName')}
              </th>
              <th className="p-3 cursor-pointer hover:text-gray-900 dark:hover:text-white" onClick={() => handleSort('email')}>
                College Email {renderSortIcon('email')}
              </th>
              <th className="p-3 cursor-pointer hover:text-gray-900 dark:hover:text-white" onClick={() => handleSort('role')}>
                Assigned Role {renderSortIcon('role')}
              </th>
              <th className="p-3 cursor-pointer hover:text-gray-900 dark:hover:text-white" onClick={() => handleSort('department')}>
                Department {renderSortIcon('department')}
              </th>
              <th className="p-3 cursor-pointer hover:text-gray-900 dark:hover:text-white" onClick={() => handleSort('registerNumber')}>
                Reg No / Mentor {renderSortIcon('registerNumber')}
              </th>
              <th className="p-3 cursor-pointer hover:text-gray-900 dark:hover:text-white" onClick={() => handleSort('isLinked')}>
                Login Status {renderSortIcon('isLinked')}
              </th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-gray-700 dark:text-gray-200">
            {paginatedList.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-400 text-xs">
                  No user accounts match the selected filters.
                </td>
              </tr>
            ) : (
              paginatedList.map((rec) => {
                const isSuperAdmin = rec.role === 'SUPER_ADMIN';
                const isStudent = rec.role === 'STUDENT';
                const isUnassigned =
                  isStudent &&
                  (!rec.mentorEmail ||
                    rec.mentorEmail.trim() === '' ||
                    rec.mentorName === 'Unassigned Mentor');

                return (
                  <tr key={rec.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                    <td className="p-3 font-semibold text-gray-900 dark:text-white">{rec.displayName}</td>
                    <td className="p-3 font-mono text-[#0B426E] dark:text-blue-400 font-medium">{rec.email}</td>
                    <td className="p-3">
                      <span className="font-semibold text-[11px] text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-600">
                        {ROLE_LABELS[rec.role] || rec.role}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-gray-700 dark:text-gray-300">{rec.department}</td>
                    <td className="p-3 text-gray-600 dark:text-gray-300">
                      {isStudent ? (
                        <div className="space-y-0.5">
                          <div>Reg: {rec.registerNumber || 'N/A'} (Yr {rec.year || 'III'}-{rec.section || 'A'})</div>
                          {isUnassigned ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-700">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              Unassigned Mentor
                            </span>
                          ) : (
                            <div className="text-[10px] text-gray-500 truncate" title={`Mentor: ${rec.mentorName || rec.mentorEmail}`}>
                              Mentor: {rec.mentorName || rec.mentorEmail}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-[11px]">Faculty / Staff</span>
                      )}
                    </td>
                    <td className="p-3">
                      {rec.isLinked ? (
                        <Badge variant="success">Active Account</Badge>
                      ) : (
                        <Badge variant="warning">Pre-Registered</Badge>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isStudent && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setAssigningStudent(rec);
                              setSelectedMentorUid(rec.rawProfile?.mentorUid || '');
                            }}
                            title="Assign / Reassign Faculty Mentor"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-[#0B426E] mr-1" /> Mentor
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(rec)}
                          title="Edit User Details"
                        >
                          <Pencil className="w-3.5 h-3.5 text-[#0B426E] mr-1" /> Edit
                        </Button>

                        {isSuperAdmin ? (
                          <div title="This account cannot be deleted.">
                            <Button
                              variant="danger"
                              size="sm"
                              disabled
                              className="opacity-40 cursor-not-allowed"
                            >
                              <Lock className="w-3 h-3 mr-1" /> Protected
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(rec)}
                            title="Delete / Deactivate Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Standardized Reusable Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={sortedList.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[10, 25, 50]}
      />

      {/* Assign Mentor Quick Modal */}
      <Modal
        isOpen={!!assigningStudent}
        onClose={() => setAssigningStudent(null)}
        title={`Assign Faculty Mentor to ${assigningStudent?.displayName}`}
      >
        <form onSubmit={handleAssignMentorSubmit} className="space-y-3 text-xs">
          <div className="p-3 bg-blue-50 dark:bg-gray-700/60 rounded-md border border-blue-200 dark:border-gray-600 text-gray-700 dark:text-gray-200">
            <p className="font-semibold text-[#0B426E] dark:text-blue-300">{assigningStudent?.displayName}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Reg: {assigningStudent?.registerNumber || 'N/A'} • Dept: {assigningStudent?.department}
            </p>
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Select Faculty Mentor *</label>
            <select
              required
              value={selectedMentorUid}
              onChange={(e) => setSelectedMentorUid(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white cursor-pointer focus:ring-1 focus:ring-[#0B426E]"
            >
              <option value="">-- Choose Faculty Mentor --</option>
              {mentors.map((m) => (
                <option key={m.uid} value={m.uid}>
                  {m.displayName} ({m.email}) — [{m.department}]
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setAssigningStudent(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={!selectedMentorUid}>
              Save Mentor Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        title={`Edit User Record: ${editingRecord?.displayName}`}
      >
        <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0B426E]"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">College Email *</label>
            <input
              type="email"
              required
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0B426E]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Role *</label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as UserRole)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white cursor-pointer focus:ring-1 focus:ring-[#0B426E]"
              >
                <option value="STUDENT">Student</option>
                <option value="MENTOR">Faculty Mentor</option>
                <option value="HOD">HOD</option>
                <option value="PRINCIPAL">Principal</option>
                <option value="ACADEMIC_COORDINATOR">Academic Coordinator</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Department *</label>
              <select
                value={editDepartment}
                onChange={(e) => setEditDepartment(e.target.value as Department)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white cursor-pointer focus:ring-1 focus:ring-[#0B426E]"
              >
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
                <option value="IT">IT</option>
                <option value="AI_DS">AI_DS</option>
              </select>
            </div>
          </div>

          {editRole === 'STUDENT' && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Register Number</label>
                  <input
                    type="text"
                    value={editRegNo}
                    onChange={(e) => setEditRegNo(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0B426E]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Year</label>
                  <select
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value as any)}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0B426E] cursor-pointer"
                  >
                    <option value="I">I</option>
                    <option value="II">II</option>
                    <option value="III">III</option>
                    <option value="IV">IV</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Section</label>
                  <input
                    type="text"
                    value={editSection}
                    onChange={(e) => setEditSection(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0B426E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">Mentor Email</label>
                <input
                  type="email"
                  placeholder="mentor@fx.edu.in"
                  value={editMentorEmail}
                  onChange={(e) => setEditMentorEmail(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0B426E]"
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setEditingRecord(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
