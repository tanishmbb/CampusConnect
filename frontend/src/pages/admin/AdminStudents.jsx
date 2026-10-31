import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Power,
  GraduationCap,
  X
} from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../components/Toast';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [minCgpa, setMinCgpa] = useState('');
  const [placementFilter, setPlacementFilter] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const toast = useToast();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedDept) params.department = selectedDept;
      if (minCgpa) params.min_cgpa = minCgpa;
      if (placementFilter) params.placement_status = placementFilter;

      const res = await api.get('/students/admin/all/', { params });
      setStudents(res.data.results || res.data || []);
    } catch (err) {
      console.error('Failed to load students:', err);
      toast.error('Failed to load student directory.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/students/departments/');
      setDepartments(res.data || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [selectedDept, minCgpa, placementFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      const res = await api.post(`/auth/users/${userId}/toggle-status/`);
      toast.success(res.data.message);
      fetchStudents();
    } catch (err) {
      toast.error('Failed to toggle user status.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Student Placement Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete academic profiles, placement records, and account governance.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, roll, or email..."
              className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.code}>{d.code} - {d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={minCgpa}
              onChange={(e) => setMinCgpa(e.target.value)}
              className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All CGPA Ranges</option>
              <option value="9.0">CGPA ≥ 9.0 (Distinction)</option>
              <option value="8.0">CGPA ≥ 8.0 (First Class)</option>
              <option value="7.0">CGPA ≥ 7.0</option>
              <option value="6.0">CGPA ≥ 6.0</option>
            </select>
          </div>

          <div>
            <select
              value={placementFilter}
              onChange={(e) => setPlacementFilter(e.target.value)}
              className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Placement Statuses</option>
              <option value="PLACED">Placed Only</option>
              <option value="NOT_PLACED">Not Placed Only</option>
            </select>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Loading student directory...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/80">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-700">No students match current filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Roll Number</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">CGPA</th>
                  <th className="px-6 py-4">Backlogs</th>
                  <th className="px-6 py-4">Placement Status</th>
                  <th className="px-6 py-4">Account Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {students.map((student) => {
                  const u = student.user || {};
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{u.first_name} {u.last_name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-700">
                        {student.roll_number || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold">
                          {student.department_details?.code || 'None'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-indigo-700">
                        {student.cgpa}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700">
                        {student.backlogs}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={student.placement_status} />
                      </td>
                      <td className="px-6 py-4">
                        {u.is_active ? (
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Active
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                        >
                          <Eye className="w-3.5 h-3.5 inline mr-1" /> View
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(u.id)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                            u.is_active
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5 inline mr-1" />
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedStudent.user?.first_name} {selectedStudent.user?.last_name}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedStudent.roll_number} • {selectedStudent.department_details?.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block font-bold uppercase">Phone</span>
                <span className="font-semibold text-slate-800">{selectedStudent.phone || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block font-bold uppercase">Email</span>
                <span className="font-semibold text-slate-800">{selectedStudent.user?.email}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block font-bold uppercase">10th Percentage</span>
                <span className="font-semibold text-slate-800">{selectedStudent.tenth_percentage}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block font-bold uppercase">12th Percentage</span>
                <span className="font-semibold text-slate-800">{selectedStudent.twelfth_percentage}%</span>
              </div>
            </div>

            {selectedStudent.skills?.length > 0 && (
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStudent.skills.map((s) => (
                    <span key={s.id} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold">
                      {s.skill_name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
