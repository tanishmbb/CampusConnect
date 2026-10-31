import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  CheckCircle2,
  Calendar,
  Award,
  ArrowRight,
  TrendingUp,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import api from '../../api/client';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/analytics/student-dashboard/');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading student dashboard...</p>
      </div>
    );
  }

  const completion = data?.profile_completion || 30;
  const isPlaced = data?.placement_status === 'PLACED';

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {data?.welcome_name} 👋
            </h1>
            {isPlaced ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-400 text-emerald-950 flex items-center gap-1 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" /> PLACED
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30">
                Placement Candidate
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-indigo-100 max-w-xl">
            {isPlaced
              ? 'Congratulations! You have accepted an offer. Your placement is finalized with the Placement Cell.'
              : 'Browse active placement drives, monitor your applications, and track interview invitations.'}
          </p>
        </div>

        {/* Profile Completion Gauge */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4 flex-shrink-0">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/20"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-400"
                strokeDasharray={`${completion}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xs font-extrabold text-white">{completion}%</span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-200">Profile Score</p>
            <Link
              to="/student/profile"
              className="text-xs font-bold text-white hover:underline flex items-center gap-1 mt-0.5"
            >
              <span>Update Profile</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        <StatCard
          title="Available Jobs"
          value={data?.available_jobs || 0}
          icon={Briefcase}
          color="indigo"
          subtitle="Matching criteria"
        />
        <StatCard
          title="Applications"
          value={data?.applications_count || 0}
          icon={FileText}
          color="blue"
          subtitle="Total submitted"
        />
        <StatCard
          title="Shortlisted"
          value={data?.shortlisted_count || 0}
          icon={CheckCircle2}
          color="purple"
          subtitle="Screening passed"
        />
        <StatCard
          title="Interviews"
          value={data?.interviews_count || 0}
          icon={Calendar}
          color="amber"
          subtitle="Scheduled rounds"
        />
        <StatCard
          title="Offers / Selected"
          value={data?.offers_count || 0}
          icon={Award}
          color="emerald"
          subtitle={isPlaced ? 'Placement Confirmed' : 'In consideration'}
        />
      </div>

      {/* Recent Applications Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Applications</h2>
            <p className="text-xs text-slate-500 mt-0.5">Track status updates from recruiters</p>
          </div>
          <Link
            to="/student/applications"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {data?.recent_applications?.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">No applications submitted yet.</p>
            <p className="text-xs text-slate-400 mt-1">Explore open jobs and submit your first application.</p>
            <Link
              to="/student/jobs"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
            >
              Browse Jobs Now
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Company</th>
                  <th className="px-6 py-3.5">Job Role</th>
                  <th className="px-6 py-3.5">Package</th>
                  <th className="px-6 py-3.5">Applied Date</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {data?.recent_applications?.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {app.job_details?.company_details?.name}
                    </td>
                    <td className="px-6 py-4 text-slate-700">{app.job_details?.title}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-700">
                      ₹{app.job_details?.salary_min} - ₹{app.job_details?.salary_max} LPA
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
        )}
      </div>
    </div>
  );
}
