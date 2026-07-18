import React, { useState } from 'react';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterPanel } from '../../components/common/FilterPanel';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { FaEdit, FaTrash, FaEye, FaUsers, FaArrowLeft, FaArrowRight, FaExclamationTriangle } from 'react-icons/fa';

interface RecordItem {
  id: string;
  name: string;
  department: string;
  email: string;
  phone: string;
  type: 'Student' | 'Faculty' | 'Department' | 'Course';
  status: 'Active' | 'Inactive';
}

export const ManageMassData: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('ALL');
  
  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);
  
  // Edit Form states
  const [editName, setEditName] = useState<string>('');
  const [editDept, setEditDept] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editError, setEditError] = useState<string>('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // Mock data
  const [records, setRecords] = useState<RecordItem[]>([
    {
      id: '951221104001',
      name: 'Arun Kumar K',
      department: 'CSE',
      email: 'arunkumar@francisxavier.ac.in',
      phone: '9876543210',
      type: 'Student',
      status: 'Active',
    },
    {
      id: '951221104045',
      name: 'Priya Dharshini M',
      department: 'CSE',
      email: 'priyadharshini@francisxavier.ac.in',
      phone: '9876543211',
      type: 'Student',
      status: 'Active',
    },
    {
      id: 'FAC-102',
      name: 'Mrs. R. Jeyanthi',
      department: 'CSE',
      email: 'rjeyanthi@francisxavier.ac.in',
      phone: '9876543212',
      type: 'Faculty',
      status: 'Active',
    },
    {
      id: 'FAC-105',
      name: 'Dr. S. Premkumar',
      department: 'CSE',
      email: 'spremkumar@francisxavier.ac.in',
      phone: '9876543213',
      type: 'Faculty',
      status: 'Active',
    },
    {
      id: 'DEP-CSE',
      name: 'Computer Science & Engineering',
      department: 'CSE',
      email: 'cse_hod@francisxavier.ac.in',
      phone: '0462-2502283',
      type: 'Department',
      status: 'Active',
    },
    {
      id: 'DEP-ECE',
      name: 'Electronics & Communication Engineering',
      department: 'ECE',
      email: 'ece_hod@francisxavier.ac.in',
      phone: '0462-2502284',
      type: 'Department',
      status: 'Active',
    },
    {
      id: 'CS301',
      name: 'Database Management Systems',
      department: 'CSE',
      email: 'dbms_coordinator@francisxavier.ac.in',
      phone: 'N/A',
      type: 'Course',
      status: 'Active',
    },
    {
      id: 'EC302',
      name: 'Digital Signal Processing',
      department: 'ECE',
      email: 'dsp_coordinator@francisxavier.ac.in',
      phone: 'N/A',
      type: 'Course',
      status: 'Active',
    },
    {
      id: '951222106012',
      name: 'Harish R',
      department: 'ECE',
      email: 'harishr@francisxavier.ac.in',
      phone: '9876543214',
      type: 'Student',
      status: 'Active',
    },
    {
      id: '951220105088',
      name: 'Sanjay P',
      department: 'EEE',
      email: 'sanjayp@francisxavier.ac.in',
      phone: '9876543215',
      type: 'Student',
      status: 'Inactive',
    },
  ]);

  // Handle Edit Action Click
  const handleEditClick = (record: RecordItem) => {
    setSelectedRecord(record);
    setEditName(record.name);
    setEditDept(record.department);
    setEditEmail(record.email);
    setEditPhone(record.phone);
    setEditError('');
    setIsEditModalOpen(true);
  };

  // Handle Edit Form Submit
  const handleEditSave = () => {
    if (!editName || !editDept || !editEmail) {
      setEditError('Name, Department, and Email fields are required.');
      return;
    }
    
    setRecords((prev) =>
      prev.map((rec) =>
        rec.id === selectedRecord?.id
          ? {
              ...rec,
              name: editName,
              department: editDept,
              email: editEmail,
              phone: editPhone,
            }
          : rec
      )
    );
    setIsEditModalOpen(false);
  };

  // Handle Delete Confirmation Click
  const handleDeleteClick = (record: RecordItem) => {
    setSelectedRecord(record);
    setIsDeleteModalOpen(true);
  };

  // Handle Delete Record
  const handleDeleteConfirm = () => {
    if (selectedRecord) {
      setRecords((prev) => prev.filter((rec) => rec.id !== selectedRecord.id));
      setIsDeleteModalOpen(false);
      setSelectedRecord(null);
    }
  };

  // Handle View Action Click
  const handleViewClick = (record: RecordItem) => {
    setSelectedRecord(record);
    setIsViewModalOpen(true);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterType('ALL');
    setCurrentPage(1);
  };

  // Filter & Search records
  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === 'ALL' || rec.type.toUpperCase() === filterType.toUpperCase();

    return matchesSearch && matchesType;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const selectOptions = [
    { label: 'All Records', value: 'ALL' },
    { label: 'Student Directory', value: 'STUDENT' },
    { label: 'Faculty directory', value: 'FACULTY' },
    { label: 'Department configurations', value: 'DEPARTMENT' },
    { label: 'Course catalogs', value: 'COURSE' },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Page Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-zinc-100 m-0">
          Manage Mass Data
        </h1>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
          Perform administrative database actions. Search, inspect, modify or delete uploaded system directories.
        </p>
      </div>

      {/* Filter and Search Panel */}
      <FilterPanel onClear={handleClearFilters}>
        <SearchBar
          value={searchTerm}
          onChange={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          placeholder="Search by ID, Name, Dept, Email..."
        />
        <div className="w-48">
          <Select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
            options={selectOptions}
          />
        </div>
      </FilterPanel>

      {/* Responsive Records Table */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          {currentItems.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-zinc-400">
              <FaUsers className="h-10 w-10 mx-auto text-gray-300 dark:text-zinc-700 mb-3" />
              <h3 className="font-bold text-sm text-gray-900 dark:text-zinc-200">No Records Found</h3>
              <p className="text-xs mt-1">Try modifying search term or clear the filter criteria.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-100 dark:divide-zinc-800 text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-6 py-3.5 font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3.5 font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3.5 font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3.5 font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3.5 font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3.5 font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {currentItems.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 transition-all">
                    <td className="px-6 py-4 font-mono font-semibold text-gray-900 dark:text-zinc-150">
                      {rec.id}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800 dark:text-zinc-250">
                      {rec.name}
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.25 rounded-md text-[10px] font-bold bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-400">
                        {rec.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-zinc-300 font-medium">
                      {rec.department}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-zinc-400">{rec.email}</td>
                    <td className="px-6 py-4">
                      <Badge status={rec.status === 'Active' ? 'APPROVED' : 'LOCKED'}>
                        {rec.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2 py-1"
                          onClick={() => handleViewClick(rec)}
                          title="View Details"
                        >
                          <FaEye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2 py-1"
                          onClick={() => handleEditClick(rec)}
                          title="Edit Record"
                        >
                          <FaEdit className="h-3 w-3 text-blue-650" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2 py-1"
                          onClick={() => handleDeleteClick(rec)}
                          title="Delete Record"
                        >
                          <FaTrash className="h-3 w-3 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Section */}
        {filteredRecords.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-zinc-400">
              Showing <span className="font-semibold">{indexOfFirstItem + 1}</span> to{' '}
              <span className="font-semibold">
                {Math.min(indexOfLastItem, filteredRecords.length)}
              </span>{' '}
              of <span className="font-semibold">{filteredRecords.length}</span> records
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="font-bold flex items-center gap-1"
              >
                <FaArrowLeft className="h-3 w-3" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="font-bold flex items-center gap-1"
              >
                Next <FaArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW RECORD MODAL */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="View Record Details"
      >
        {selectedRecord && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-gray-100 dark:border-zinc-800">
              <span className="text-gray-400 font-medium">Record ID:</span>
              <span className="col-span-2 font-mono font-bold text-gray-950 dark:text-zinc-150">
                {selectedRecord.id}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-gray-100 dark:border-zinc-800">
              <span className="text-gray-400 font-medium">Record Type:</span>
              <span className="col-span-2 font-bold text-gray-800 dark:text-zinc-250">
                {selectedRecord.type}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-gray-100 dark:border-zinc-800">
              <span className="text-gray-400 font-medium">Name:</span>
              <span className="col-span-2 font-bold text-gray-800 dark:text-zinc-250">
                {selectedRecord.name}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-gray-100 dark:border-zinc-800">
              <span className="text-gray-400 font-medium">Department:</span>
              <span className="col-span-2 font-medium text-gray-800 dark:text-zinc-200">
                {selectedRecord.department}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-gray-100 dark:border-zinc-800">
              <span className="text-gray-400 font-medium">Email Address:</span>
              <span className="col-span-2 text-gray-800 dark:text-zinc-200 font-medium break-all">
                {selectedRecord.email}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-gray-100 dark:border-zinc-800">
              <span className="text-gray-400 font-medium">Phone / Contact:</span>
              <span className="col-span-2 text-gray-800 dark:text-zinc-200 font-medium">
                {selectedRecord.phone}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-1.5">
              <span className="text-gray-400 font-medium">Database Status:</span>
              <span className="col-span-2">
                <Badge status={selectedRecord.status === 'Active' ? 'APPROVED' : 'LOCKED'}>
                  {selectedRecord.status}
                </Badge>
              </span>
            </div>
            <div className="flex justify-end pt-3">
              <Button onClick={() => setIsViewModalOpen(false)} variant="secondary">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* EDIT RECORD MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Record Directory"
      >
        {selectedRecord && (
          <div className="space-y-4">
            <p className="text-xs text-gray-400 mb-2">
              Modifying record ID:{' '}
              <span className="font-mono font-bold text-gray-700 dark:text-zinc-300">
                {selectedRecord.id}
              </span>{' '}
              ({selectedRecord.type})
            </p>

            <Input
              label="Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Full name"
            />

            <Input
              label="Department"
              value={editDept}
              onChange={(e) => setEditDept(e.target.value)}
              placeholder="Department short code (e.g. CSE)"
            />

            <Input
              label="Email"
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder="Institutional email"
            />

            <Input
              label="Phone"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              placeholder="Contact number"
            />

            {editError && <p className="text-xs text-red-500 font-semibold">{editError}</p>}

            <div className="flex justify-end gap-3 pt-3">
              <Button onClick={() => setIsEditModalOpen(false)} variant="outline">
                Cancel
              </Button>
              <Button onClick={handleEditSave} variant="primary">
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE RECORD MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Record Deletion"
      >
        {selectedRecord && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-lg">
              <FaExclamationTriangle className="h-6 w-6 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold">This action is irreversible!</p>
                <p className="text-[10px] opacity-90">
                  Deleting this entity will remove all associated database mappings permanently.
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-650 dark:text-zinc-300">
              Are you sure you want to delete the {selectedRecord.type.toLowerCase()}{' '}
              <strong className="text-gray-900 dark:text-zinc-100">
                "{selectedRecord.name}"
              </strong>{' '}
              with ID <code className="font-bold font-mono">{selectedRecord.id}</code>?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <Button onClick={() => setIsDeleteModalOpen(false)} variant="outline">
                Cancel
              </Button>
              <Button onClick={handleDeleteConfirm} variant="danger">
                Delete Record
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
