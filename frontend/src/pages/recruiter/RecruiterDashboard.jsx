import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Award,
  PlusCircle,
  Building2,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import api from '../../api/client';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';

export default function RecruiterDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/recruiter-dashboard/');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load recruiter dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading recruiter dashboard...</p>
      </div>
    );
  }

  const isApproved = data?.approval_status === 'APPROVED';

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {data?.company_name || 'Recruiter Portal'}
            </h1>
            <StatusBadge status={data?.approval_status || 'PENDING'} />
          </div>
          <p className="mt-2 text-sm text-slate-300 max-w-xl">
            {isApproved
              ? 'Your company profile is verified. You can post job openings, screen student applicants, and schedule technical interview rounds.'
              : 'Your company profile is currently pending review by the College Placement Cell. Once approved, your job postings will go live to students.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/recruiter/jobs/new"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Job</span>
          </Link>
          <Link
            to="/recruiter/company"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition flex items-center gap-1.5"
          >
            <Building2 className="w-4 h-4" />
            <span>Company Profile</span>
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Active Drives"
          value={data?.active_jobs || 0}
          icon={Briefcase}
          color="indigo"
          subtitle="Live on student portal"
        />
        <StatCard
          title="Total Applicants"
          value={data?.total_applicants || 0}
          icon={Users}
          color="blue"
          subtitle="Received candidates"
        />
        <StatCard
          title="Shortlisted"
          value={data?.shortlisted || 0}
          icon={CheckCircle2}
          color="purple"
          subtitle="Ready for interview"
        />
        <StatCard
          title="Selected / Hired"
          value={data?.selected || 0}
          icon={Award}
          color="emerald"
          subtitle="Offers extended"
        />
      </div>

      {/* Recent Applicants */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Candidate Applications</h2>
            <p className="text-xs text-slate-500 mt-0.5">Students who applied to your open drives</p>
          </div>
          <Link
            to="/recruiter/jobs"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View All Drives</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data?.recent_applications?.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">No applicants received yet.</p>
            <p className="text-xs text-slate-400 mt-1">
              Ensure your job postings are ACTIVE and open to eligible departments.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Candidate</th>
                  <th className="px-6 py-3.5">Applied Role</th>
                  <th className="px-6 py-3.5">CGPA</th>
                  <th className="px-6 py-3.5">Applied Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {data?.recent_applications?.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900">
                          {app.student_details?.user?.first_name} {app.student_details?.user?.last_name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {app.student_details?.roll_number} • {app.student_details?.department_details?.code}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {app.job_details?.title}
                    </td>
                    <td className="px-6 py-4 font-bold text-indigo-700">
                      {app.student_details?.cgpa}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/recruiter/jobs/${app.job}/applicants`}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                      >
                        Review Application →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
