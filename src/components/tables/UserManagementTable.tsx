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

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  registry,
  onUpdateUser,
  onUpdateRegistry,
  onSoftDeleteUser,
  onDeleteRegistry,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<SortColumn>('displayName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [editingRecord, setEditingRecord] = useState<UnifiedUserRecord | null>(null);

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

    // Add active users from users collection
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

    // Add unlinked imported users from imported_users collection
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

  // 2. Real-time Multi-Field Search Filter
  const filteredList = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return unifiedList;

    return unifiedList.filter((item) => {
      return (
        item.displayName.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.registerNumber?.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q) ||
        item.mentorEmail?.toLowerCase().includes(q) ||
        ROLE_LABELS[item.role]?.toLowerCase().includes(q)
      );
    });
  }, [unifiedList, searchQuery]);

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
      if (editingRecord?.source === 'users') {
        onSoftDeleteUser(rec.id);
      } else {
        onDeleteRegistry(rec.id);
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Realtime Search Bar Header */}
      <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search accounts by name, email, reg no, department..."
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-xs text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0B426E]"
          />
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          Showing <strong className="text-gray-800 dark:text-gray-100">{sortedList.length}</strong> of {unifiedList.length} accounts
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
                Reg No / Class {renderSortIcon('registerNumber')}
              </th>
              <th className="p-3 cursor-pointer hover:text-gray-900 dark:hover:text-white" onClick={() => handleSort('isLinked')}>
                Login Status {renderSortIcon('isLinked')}
              </th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-gray-700 dark:text-gray-200">
            {sortedList.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-400 text-xs">
                  No institutional user records found matching your search.
                </td>
              </tr>
            ) : (
              sortedList.map((rec) => {
                const isSuperAdmin = rec.role === 'SUPER_ADMIN';
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
                      {rec.role === 'STUDENT' ? (
                        <div>
                          <div>Reg: {rec.registerNumber || 'N/A'}</div>
                          <div className="text-[10px] text-gray-500">
                            Yr {rec.year || 'III'} • Sec {rec.section || 'A'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-[11px]">Staff / Faculty</span>
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
