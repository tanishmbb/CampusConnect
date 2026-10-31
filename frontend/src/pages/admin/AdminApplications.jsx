import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Search, Filter, MapPin } from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../components/Toast';

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const toast = useToast();

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/applications/', { params });
      setApplications(res.data.results || res.data || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
      toast.error('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Campus Drive Applications Master Log
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete applicant records across all active and completed placement drives.
        </p>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Filter Status:</span>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">All Application Stages</option>
          <option value="APPLIED">Applied</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="SHORTLISTED">Shortlisted</option>
          <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
          <option value="SELECTED">Selected / Placed</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Loading applicant records...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/80">
          <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-700">No applications match filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Student Candidate</th>
                  <th className="px-6 py-4">Roll & Dept</th>
                  <th className="px-6 py-4">CGPA</th>
                  <th className="px-6 py-4">Role & Company</th>
                  <th className="px-6 py-4">Applied Date</th>
                  <th className="px-6 py-4">Current Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {app.student_details?.user?.first_name} {app.student_details?.user?.last_name}
                      <p className="text-xs text-slate-400 font-normal">{app.student_details?.user?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span className="font-bold text-slate-700">{app.student_details?.department_details?.code}</span>
                      <p className="text-slate-400">{app.student_details?.roll_number}</p>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-indigo-700">
                      {app.student_details?.cgpa}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{app.job_details?.title}</p>
                      <p className="text-xs text-indigo-600 font-semibold">{app.job_details?.company_details?.name}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
