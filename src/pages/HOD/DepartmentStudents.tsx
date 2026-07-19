import React, { useState, useMemo } from 'react';
import { Filter, Search, GraduationCap, ArrowUp, ArrowDown, Eye } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useStudentsForDepartment, useMentorsByDepartment } from '../../hooks/useUserManagement';
import { useAllODRequests } from '../../hooks/useODRequests';
import type { UserProfile } from '../../types/user';
import { StudentProfileModal } from '../../components/modals/StudentProfileModal';
import { Loader } from '../../components/common/Loader';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

type SortCol = 'displayName' | 'registerNumber' | 'mentorName' | 'year' | 'section';

export const DepartmentStudents: React.FC = () => {
  const { userProfile } = useAuth();
  const { data: students = [], isLoading } = useStudentsForDepartment(userProfile?.department);
  const { data: mentors = [] } = useMentorsByDepartment(userProfile?.department);
  const { data: allODs = [] } = useAllODRequests();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [selectedMentorEmail, setSelectedMentorEmail] = useState<string>('ALL');
  const [sortCol, setSortCol] = useState<SortCol>('displayName');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);

  // Filter & Search Logic
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.displayName.toLowerCase().includes(q) ||
        (s.registerNumber || '').toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.mentorName || '').toLowerCase().includes(q) ||
        (s.mentorEmail || '').toLowerCase().includes(q);

      const matchesYear = selectedYear === 'ALL' || (s.year || 'III') === selectedYear;
      const matchesSection = selectedSection === 'ALL' || (s.section || 'A').toUpperCase() === selectedSection;
      const matchesMentor = selectedMentorEmail === 'ALL' || (s.mentorEmail || '').toLowerCase() === selectedMentorEmail.toLowerCase();

      return matchesSearch && matchesYear && matchesSection && matchesMentor;
    });
  }, [students, searchQuery, selectedYear, selectedSection, selectedMentorEmail]);

  // Sort Logic
  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      const valA = (a[sortCol] || '').toString().toLowerCase();
      const valB = (b[sortCol] || '').toString().toLowerCase();

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredStudents, sortCol, sortDir]);

  const toggleSort = (col: SortCol) => {
    if (sortCol === col) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const getStudentODStatus = (studentUid: string) => {
    const studentReqs = allODs.filter((r) => r.studentUid === studentUid && !r.isDeleted);
    if (studentReqs.length === 0) return { label: 'No Applications', variant: 'info' as const };

    const latest = studentReqs[0];
    if (latest.status === 'HOD_APPROVED') return { label: 'Approved', variant: 'success' as const };
    if (latest.status === 'PENDING' || latest.status === 'MENTOR_APPROVED') return { label: 'Pending Approval', variant: 'warning' as const };
    return { label: 'Rejected', variant: 'danger' as const };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">Department Students Directory ({userProfile?.department})</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Complete directory of all registered students in the {userProfile?.department} department.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs space-y-3 text-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student name, reg no, email, mentor name..."
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0B426E]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Year Filter */}
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-2.5 py-1 text-xs">
              <Filter className="text-[#0B426E] dark:text-blue-400 w-3.5 h-3.5" />
              <span className="text-gray-500 dark:text-gray-400 font-medium">Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent text-gray-900 dark:text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="dark:bg-gray-800">All</option>
                <option value="I" className="dark:bg-gray-800">I</option>
                <option value="II" className="dark:bg-gray-800">II</option>
                <option value="III" className="dark:bg-gray-800">III</option>
                <option value="IV" className="dark:bg-gray-800">IV</option>
              </select>
            </div>

            {/* Section Filter */}
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-2.5 py-1 text-xs">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Sec:</span>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="bg-transparent text-gray-900 dark:text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="dark:bg-gray-800">All</option>
                <option value="A" className="dark:bg-gray-800">A</option>
                <option value="B" className="dark:bg-gray-800">B</option>
                <option value="C" className="dark:bg-gray-800">C</option>
              </select>
            </div>

            {/* Mentor Filter */}
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-2.5 py-1 text-xs">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Mentor:</span>
              <select
                value={selectedMentorEmail}
                onChange={(e) => setSelectedMentorEmail(e.target.value)}
                className="bg-transparent text-gray-900 dark:text-white font-semibold focus:outline-none cursor-pointer max-w-[130px]"
              >
                <option value="ALL" className="dark:bg-gray-800">All Mentors</option>
                {mentors.map((m) => (
                  <option key={m.uid} value={m.email} className="dark:bg-gray-800">
                    {m.displayName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Department Students Cards & Table */}
      {isLoading ? (
        <Loader label="Loading department student records..." />
      ) : sortedStudents.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs">
          No students found matching current department filters.
        </div>
      ) : (
        <>
          {/* Mobile Stacked Cards (< md) */}
          <div className="space-y-3 md:hidden">
            {sortedStudents.map((s) => {
              const odStatus = getStudentODStatus(s.uid);
              return (
                <div
                  key={s.uid}
                  className="p-3.5 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <GraduationCap className="w-4 h-4 text-[#0B426E] dark:text-blue-300 shrink-0" />
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{s.displayName}</h3>
                    </div>
                    <Badge variant={odStatus.variant}>{odStatus.label}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 dark:text-gray-300">
                    <div>
                      <span className="text-gray-400 block">Register No</span>
                      <span className="font-mono font-bold text-[#0B426E] dark:text-blue-300">{s.registerNumber || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Mentor</span>
                      <span className="font-semibold truncate block">{s.mentorName || 'Faculty Mentor'}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
                    <span className="text-[11px] text-gray-500">Yr {s.year || 'III'} ({s.section || 'A'})</span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedStudent(s)}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> View Profile
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block overflow-x-auto bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 uppercase font-semibold text-[11px] tracking-wider select-none">
                  <th className="p-3 cursor-pointer hover:text-gray-900 dark:hover:text-white" onClick={() => toggleSort('displayName')}>
                    Student Name {sortCol === 'displayName' && (sortDir === 'asc' ? <ArrowUp className="inline w-3 h-3 text-[#0B426E] ml-1" /> : <ArrowDown className="inline w-3 h-3 text-[#0B426E] ml-1" />)}
                  </th>
                  <th className="p-3 cursor-pointer hover:text-gray-900 dark:hover:text-white" onClick={() => toggleSort('registerNumber')}>
                    Register No {sortCol === 'registerNumber' && (sortDir === 'asc' ? <ArrowUp className="inline w-3 h-3 text-[#0B426E] ml-1" /> : <ArrowDown className="inline w-3 h-3 text-[#0B426E] ml-1" />)}
                  </th>
                  <th className="p-3 cursor-pointer hover:text-gray-900 dark:hover:text-white" onClick={() => toggleSort('mentorName')}>
                    Assigned Mentor {sortCol === 'mentorName' && (sortDir === 'asc' ? <ArrowUp className="inline w-3 h-3 text-[#0B426E] ml-1" /> : <ArrowDown className="inline w-3 h-3 text-[#0B426E] ml-1" />)}
                  </th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Current OD Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-gray-700 dark:text-gray-200">
                {sortedStudents.map((s) => {
                  const odStatus = getStudentODStatus(s.uid);
                  return (
                    <tr key={s.uid} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <GraduationCap className="text-[#0B426E] dark:text-blue-300 w-4 h-4" />
                          <span>{s.displayName}</span>
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono">{s.email}</div>
                      </td>
                      <td className="p-3 font-mono font-bold text-[#0B426E] dark:text-blue-300">
                        {s.registerNumber || 'N/A'}
                      </td>
                      <td className="p-3 text-gray-800 dark:text-gray-200 font-semibold">
                        {s.mentorName || 'Faculty Mentor'}
                        <div className="text-[10px] text-gray-500 font-mono">{s.mentorEmail || 'N/A'}</div>
                      </td>
                      <td className="p-3 text-gray-600 dark:text-gray-300">
                        Year {s.year || 'III'} • Sec {s.section || 'A'}
                      </td>
                      <td className="p-3">
                        <Badge variant={odStatus.variant}>{odStatus.label}</Badge>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedStudent(s)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> View Profile
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Student Profile Modal */}
      <StudentProfileModal
        student={selectedStudent}
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        canEdit={false}
      />
    </div>
  );
};
