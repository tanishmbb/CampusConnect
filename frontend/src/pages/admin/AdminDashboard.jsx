import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  Briefcase,
  FileSpreadsheet,
  Award,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import api from '../../api/client';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../components/Toast';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, compRes, jobsRes] = await Promise.all([
        api.get('/analytics/admin/'),
        api.get('/companies/?approval_status=PENDING'),
        api.get('/jobs/?status=PENDING_APPROVAL'),
      ]);
      setAnalytics(analyticsRes.data);
      setPendingCompanies(compRes.data.results || compRes.data || []);
      setPendingJobs(jobsRes.data.results || jobsRes.data || []);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
      toast.error('Failed to load placement cell dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApproveCompany = async (companyId) => {
    try {
      await api.post(`/companies/${companyId}/approve/`);
      toast.success('Company approved. Recruiter can now publish active drives.');
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to approve company.');
    }
  };

  const handleRejectCompany = async (companyId) => {
    try {
      await api.post(`/companies/${companyId}/reject/`);
      toast.info('Company registration rejected.');
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to reject company.');
    }
  };

  const handleApproveJob = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/approve/`);
      toast.success('Job posting approved! It is now ACTIVE and visible to eligible students.');
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to approve job.');
    }
  };

  const handleRejectJob = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/reject/`);
      toast.info('Job posting rejected.');
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to reject job.');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading placement cell control center...</p>
      </div>
    );
  }

  const overview = analytics?.overview || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
            Placement Cell Control Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Placement Operations Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Supervise corporate approvals, job postings, student eligibility, and campus drives.
          </p>
        </div>
        <Link
          to="/admin/analytics"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
        >
          <TrendingUp className="w-4 h-4" />
          <span>Full Visual Analytics</span>
        </Link>
      </div>

      {/* High-level KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="Students"
          value={overview.total_students || 0}
          icon={Users}
          color="indigo"
          subtitle="Registered batch"
        />
        <StatCard
          title="Companies"
          value={overview.total_companies || 0}
          icon={Building2}
          color="blue"
          subtitle={`${overview.approved_companies || 0} Approved`}
        />
        <StatCard
          title="Active Drives"
          value={overview.active_jobs || 0}
          icon={Briefcase}
          color="amber"
          subtitle={`${overview.pending_jobs || 0} Pending`}
        />
        <StatCard
          title="Applications"
          value={overview.total_applications || 0}
          icon={FileSpreadsheet}
          color="purple"
          subtitle="Total submitted"
        />
        <StatCard
          title="Placed"
          value={overview.placed_students || 0}
          icon={Award}
          color="emerald"
          subtitle={`${overview.placement_percentage || 0}% Placement`}
        />
        <StatCard
          title="Highest CTC"
          value={`₹${overview.highest_package || 0} LPA`}
          icon={TrendingUp}
          color="rose"
          subtitle={`Avg: ₹${overview.average_package || 0} LPA`}
        />
      </div>

      {/* Pending Approvals Section: Companies & Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Companies */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-500" />
                <span>Companies Awaiting Verification</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {pendingCompanies.length} pending corporate registrations
              </p>
            </div>
            <Link to="/admin/companies" className="text-xs font-bold text-indigo-600 hover:underline">
              All Companies
            </Link>
          </div>

          {pendingCompanies.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              All registered companies have been reviewed.
            </p>
          ) : (
            <div className="space-y-3">
              {pendingCompanies.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
                >
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                    <p className="text-xs text-slate-500">{c.industry} • {c.location}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{c.contact_email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveCompany(c.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleRejectCompany(c.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Jobs */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-500" />
                <span>Job Openings Awaiting Approval</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {pendingJobs.length} job drives submitted by recruiters
              </p>
            </div>
            <Link to="/admin/jobs" className="text-xs font-bold text-indigo-600 hover:underline">
              All Drives
            </Link>
          </div>

          {pendingJobs.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              All recruitment postings have been reviewed.
            </p>
          ) : (
            <div className="space-y-3">
              {pendingJobs.map((j) => (
                <div
                  key={j.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
                >
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{j.title}</h3>
                    <p className="text-xs text-indigo-600 font-semibold">{j.company_details?.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      ₹{j.salary_min} - ₹{j.salary_max} LPA • Min CGPA: {j.minimum_cgpa}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveJob(j.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleRejectJob(j.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
