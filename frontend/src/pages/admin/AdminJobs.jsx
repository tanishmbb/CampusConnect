import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  Search,
  Users
} from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../components/Toast';

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const toast = useToast();

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/jobs/', { params });
      setJobs(res.data.results || res.data || []);
    } catch (err) {
      console.error('Failed to load jobs:', err);
      toast.error('Failed to load job listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const handleApprove = async (id) => {
    try {
      await api.post(`/jobs/${id}/approve/`);
      toast.success('Job drive approved and set to ACTIVE.');
      fetchJobs();
    } catch (err) {
      toast.error('Failed to approve job.');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(`/jobs/${id}/reject/`);
      toast.info('Job drive rejected.');
      fetchJobs();
    } catch (err) {
      toast.error('Failed to reject job.');
    }
  };

  const handleClose = async (id) => {
    try {
      await api.post(`/jobs/${id}/close/`);
      toast.info('Job drive closed.');
      fetchJobs();
    } catch (err) {
      toast.error('Failed to close job.');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Placement Job Drives Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review, approve, and oversee all campus hiring job requirements and status lifecycles.
        </p>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by role, company name, location..."
              className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="PENDING_APPROVAL">Pending Approval Only</option>
              <option value="ACTIVE">Active Only</option>
              <option value="CLOSED">Closed Only</option>
              <option value="REJECTED">Rejected Only</option>
            </select>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Loading placement drives...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/80">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-700">No job drives match criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Role Title</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Package</th>
                  <th className="px-6 py-4">Min CGPA</th>
                  <th className="px-6 py-4">Applications</th>
                  <th className="px-6 py-4">Deadline</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{job.title}</p>
                      <p className="text-xs text-slate-400">{job.job_type} • {job.location}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {job.company_details?.name}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-700">
                      ₹{job.salary_min} - ₹{job.salary_max} LPA
                    </td>
                    <td className="px-6 py-4 font-bold text-indigo-700">
                      {job.minimum_cgpa}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-700 text-xs">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {job.applications_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {job.application_deadline}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5">
                      {job.status === 'PENDING_APPROVAL' && (
                        <button
                          onClick={() => handleApprove(job.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
                        >
                          Approve
                        </button>
                      )}
                      {job.status === 'PENDING_APPROVAL' && (
                        <button
                          onClick={() => handleReject(job.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition"
                        >
                          Reject
                        </button>
                      )}
                      {job.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleClose(job.id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
                        >
                          Close
                        </button>
                      )}
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
