import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import {
  FaUsers,
  FaUserTie,
  FaBuilding,
  FaFileArchive,
  FaCloudUploadAlt,
  FaFileCsv,
  FaFileExcel,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
} from 'react-icons/fa';

interface UploadHistoryItem {
  id: string;
  fileName: string;
  dataType: string;
  uploadedBy: string;
  date: string;
  status: 'Uploaded' | 'Failed' | 'Processing';
}

export const UploadMassData: React.FC = () => {
  const [dataType, setDataType] = useState<string>('STUDENT');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Mock Upload History
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([
    {
      id: '1',
      fileName: 'student_list_cse_2026.xlsx',
      dataType: 'Student Data',
      uploadedBy: 'Super Admin',
      date: '2026-07-18 10:30 AM',
      status: 'Uploaded',
    },
    {
      id: '2',
      fileName: 'ece_faculty_members.csv',
      dataType: 'Faculty Data',
      uploadedBy: 'Super Admin',
      date: '2026-07-17 02:15 PM',
      status: 'Uploaded',
    },
    {
      id: '3',
      fileName: 'departments_v2.csv',
      dataType: 'Department Data',
      uploadedBy: 'Super Admin',
      date: '2026-07-15 11:00 AM',
      status: 'Failed',
    },
    {
      id: '4',
      fileName: 'all_college_courses.xlsx',
      dataType: 'Course Data',
      uploadedBy: 'Super Admin',
      date: '2026-07-14 09:45 AM',
      status: 'Uploaded',
    },
  ]);

  // Handle Drag & Drop events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (validTypes.includes(file.type) || fileExtension === 'csv' || fileExtension === 'xlsx') {
        setSelectedFile(file);
      } else {
        alert('Invalid file format. Please upload CSV or Excel (.xlsx) files.');
      }
    }
  };

  // Handle file input selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Trigger file upload simulation
  const handleUpload = () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Add temporary processing history item
    const newHistoryItem: UploadHistoryItem = {
      id: `temp-${Date.now()}`,
      fileName: selectedFile.name,
      dataType:
        dataType === 'STUDENT'
          ? 'Student Data'
          : dataType === 'FACULTY'
          ? 'Faculty Data'
          : dataType === 'DEPARTMENT'
          ? 'Department Data'
          : 'Course Data',
      uploadedBy: 'Super Admin',
      date: new Date().toLocaleString(),
      status: 'Processing',
    };

    setUploadHistory((prev) => [newHistoryItem, ...prev]);

    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadProgress(null);

          // Update status to 'Uploaded' (or random 'Failed' for realism 5% of times)
          const finalStatus = Math.random() > 0.05 ? 'Uploaded' : 'Failed';
          setUploadHistory((prevHistory) =>
            prevHistory.map((item) =>
              item.id === newHistoryItem.id ? { ...item, status: finalStatus as any } : item
            )
          );
          setSelectedFile(null);
          return null;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadProgress(null);
    setIsUploading(false);
  };

  const dropdownOptions = [
    { label: 'Student Data', value: 'STUDENT' },
    { label: 'Faculty Data', value: 'FACULTY' },
    { label: 'Department Data', value: 'DEPARTMENT' },
    { label: 'Course Data', value: 'COURSE' },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Page Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-zinc-100 m-0">
          Upload Mass Data
        </h1>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
          Bulk import student directory, faculty lists, department configurations, and course schedules.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Students"
          value="4,820"
          icon={<FaUsers className="h-6 w-6" />}
          color="blue"
          description="Active student directory"
        />
        <StatsCard
          title="Total Staff"
          value="340"
          icon={<FaUserTie className="h-6 w-6" />}
          color="yellow"
          description="Mentors, HODs, & admins"
        />
        <StatsCard
          title="Total Departments"
          value="12"
          icon={<FaBuilding className="h-6 w-6" />}
          color="green"
          description="Registered college departments"
        />
        <StatsCard
          title="Total Uploaded Files"
          value={uploadHistory.length.toString()}
          icon={<FaFileArchive className="h-6 w-6" />}
          color="red"
          description="Archived import history"
        />
      </div>

      {/* Upload Section & Main Action Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2 space-y-6">
          <h2 className="text-base font-bold text-gray-800 dark:text-zinc-200">
            Import New Data Source
          </h2>

          <div className="space-y-4">
            {/* DataType Dropdown */}
            <div className="max-w-xs">
              <Select
                label="Select Data Type to Import"
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
                options={dropdownOptions}
              />
            </div>

            {/* Drag & Drop Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                dragActive
                  ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/10'
                  : 'border-gray-300 dark:border-zinc-700 hover:border-gray-400 hover:bg-gray-50/50 dark:hover:bg-zinc-800/10'
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('mass-data-file-input')?.click()}
            >
              <input
                id="mass-data-file-input"
                type="file"
                className="hidden"
                accept=".csv, .xlsx"
                onChange={handleFileChange}
                disabled={isUploading}
              />

              <FaCloudUploadAlt className="h-12 w-12 text-blue-500 mb-3" />
              <p className="text-sm font-semibold text-gray-700 dark:text-zinc-250">
                Drag & drop your file here, or{' '}
                <span className="text-blue-600 hover:underline">browse</span>
              </p>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                Supported formats: CSV, Excel (.xlsx) • Max size 10MB
              </p>
            </div>

            {/* Display Selected File */}
            {selectedFile && (
              <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  {selectedFile.name.endsWith('.xlsx') ? (
                    <FaFileExcel className="h-6 w-6 text-green-600" />
                  ) : (
                    <FaFileCsv className="h-6 w-6 text-blue-500" />
                  )}
                  <div>
                    <p className="text-xs font-bold text-gray-800 dark:text-zinc-200">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                  className="text-xs font-bold text-red-500 hover:text-red-650 cursor-pointer"
                  disabled={isUploading}
                >
                  Remove
                </button>
              </div>
            )}

            {/* Upload Progress Bar */}
            {uploadProgress !== null && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-gray-600 dark:text-zinc-400">
                  <span>Importing records...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                variant="primary"
                className="font-bold flex items-center gap-2"
              >
                {isUploading && <FaSpinner className="animate-spin h-3.5 w-3.5" />}
                Upload
              </Button>
              <Button
                onClick={handleReset}
                disabled={!selectedFile || isUploading}
                variant="outline"
                className="font-bold"
              >
                Reset
              </Button>
            </div>
          </div>
        </Card>

        {/* Informational Guidelines Card */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200">
            Import Instructions
          </h3>
          <ul className="space-y-3.5 text-xs text-gray-600 dark:text-zinc-400 list-disc list-inside">
            <li>
              Ensure files use UTF-8 character encoding to prevent corrupt student names or roll
              numbers.
            </li>
            <li>
              <strong>Student List</strong> must contain columns:{' '}
              <code className="text-blue-600 font-semibold">registerNumber</code>,{' '}
              <code className="text-blue-600 font-semibold">name</code>,{' '}
              <code className="text-blue-600 font-semibold">department</code>, and{' '}
              <code className="text-blue-600 font-semibold">email</code>.
            </li>
            <li>
              <strong>Faculty List</strong> must contain fields:{' '}
              <code className="text-blue-600 font-semibold">staffId</code>,{' '}
              <code className="text-blue-600 font-semibold">name</code>, and{' '}
              <code className="text-blue-600 font-semibold">department</code>.
            </li>
            <li>Duplicates will automatically be merged, retaining the most recent records.</li>
          </ul>
        </Card>
      </div>

      {/* Recent Upload History Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-900 dark:text-zinc-150">Recent Upload History</h3>
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-zinc-800 text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-6 py-3.5 font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                    File Name
                  </th>
                  <th className="px-6 py-3.5 font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                    Data Type
                  </th>
                  <th className="px-6 py-3.5 font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                    Uploaded By
                  </th>
                  <th className="px-6 py-3.5 font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3.5 font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {uploadHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 transition-all">
                    <td className="px-6 py-4 font-mono font-semibold text-gray-900 dark:text-zinc-150">
                      {item.fileName}
                    </td>
                    <td className="px-6 py-4 text-gray-800 dark:text-zinc-200">{item.dataType}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-zinc-400">{item.uploadedBy}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-zinc-400">{item.date}</td>
                    <td className="px-6 py-4">
                      {item.status === 'Uploaded' ? (
                        <Badge status="APPROVED">
                          <span className="flex items-center gap-1">
                            <FaCheckCircle className="h-3 w-3" /> Uploaded
                          </span>
                        </Badge>
                      ) : item.status === 'Failed' ? (
                        <Badge status="REJECTED">
                          <span className="flex items-center gap-1">
                            <FaTimesCircle className="h-3 w-3" /> Failed
                          </span>
                        </Badge>
                      ) : (
                        <Badge status="PENDING">
                          <span className="flex items-center gap-1 animate-pulse">
                            <FaSpinner className="animate-spin h-3.5 w-3.5" /> Processing
                          </span>
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
