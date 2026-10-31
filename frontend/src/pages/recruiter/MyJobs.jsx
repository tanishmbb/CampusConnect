import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  PlusCircle,
  Calendar,
  MapPin,
  Edit,
  XCircle,
  Eye,
  ArrowRight
} from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../components/Toast';

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/jobs/my_jobs/');
      setJobs(res.data.results || res.data || []);
    } catch (err) {
      console.error('Failed to load recruiter jobs:', err);
      toast.error('Failed to load your company jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const handleCloseJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to close this job drive?')) return;
    try {
      await api.post(`/jobs/${jobId}/close/`);
      toast.success('Job drive closed.');
      fetchMyJobs();
    } catch (err) {
      toast.error('Failed to close job.');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading company jobs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Company Job Postings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your recruitment drives, applicant funnels, and status workflows.
          </p>
        </div>
        <Link
          to="/recruiter/jobs/new"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Job</span>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/80">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-700">No job drives published yet.</p>
          <p className="text-xs text-slate-400 mt-1">
            Create your first campus hiring opening to start screening student profiles.
          </p>
          <Link
            to="/recruiter/jobs/new"
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm"
          >
            <span>Create Job Posting</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Job Title</th>
                  <th className="px-6 py-4">Type & Location</th>
                  <th className="px-6 py-4">Salary Package</th>
                  <th className="px-6 py-4">Applicants</th>
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
                      <p className="text-xs text-slate-400">Min CGPA: {job.minimum_cgpa}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-semibold text-slate-700">{job.job_type}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {job.location}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-700">
                      ₹{job.salary_min} - ₹{job.salary_max} LPA
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/recruiter/jobs/${job.id}/applicants`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{job.applications_count} Candidates</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {job.application_deadline}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        to={`/recruiter/jobs/${job.id}/applicants`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition"
                        title="View Candidates"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Applicants</span>
                      </Link>
                      <Link
                        to={`/recruiter/jobs/${job.id}/edit`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                        title="Edit Job"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>
                      {job.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleCloseJob(job.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition"
                          title="Close Job Drive"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Close</span>
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
