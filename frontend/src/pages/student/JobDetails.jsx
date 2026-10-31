import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Briefcase,
  GraduationCap,
  Send,
  ExternalLink
} from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../components/Toast';

export default function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const toast = useToast();

  const fetchJobData = async () => {
    try {
      setLoading(true);
      const [jobRes, eligRes] = await Promise.all([
        api.get(`/jobs/${id}/`),
        api.get(`/jobs/${id}/eligibility/`),
      ]);
      setJob(jobRes.data);
      setEligibility(eligRes.data);
    } catch (err) {
      console.error('Failed to load job details:', err);
      toast.error('Failed to load job details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobData();
  }, [id]);

  const handleApply = async () => {
    try {
      setSubmitting(true);
      await api.post('/applications/', {
        job_id: job.id,
        cover_letter: coverLetter,
      });
      toast.success(`Successfully applied to ${job.title}!`);
      fetchJobData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-sm font-bold text-slate-700">Job position not found.</p>
        <Link to="/student/jobs" className="mt-3 inline-block text-xs font-bold text-indigo-600">
          Back to Jobs
        </Link>
      </div>
    );
  }

  const isEligible = eligibility?.is_eligible;
  const alreadyApplied = eligibility?.already_applied;
  const checks = eligibility?.checks || {};
  const reasons = eligibility?.reasons || [];

  return (
    <div className="space-y-8 max-w-5xl">
      <Link
        to="/student/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Open Roles</span>
      </Link>

      {/* Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              {job.company_details?.name}
            </span>
            <StatusBadge status={job.job_type} size="xs" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {job.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
            </span>
            <span className="text-emerald-700 font-bold">
              ₹{job.salary_min} - ₹{job.salary_max} LPA
            </span>
            <span className="flex items-center gap-1.5 text-rose-600">
              <Calendar className="w-3.5 h-3.5 text-rose-400" /> Deadline: {job.application_deadline}
            </span>
          </div>
        </div>

        {alreadyApplied ? (
          <span className="px-5 py-2.5 rounded-2xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>Already Applied</span>
          </span>
        ) : isEligible ? (
          <span className="px-5 py-2.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Eligible to Apply ✓</span>
          </span>
        ) : (
          <span className="px-5 py-2.5 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>Not Eligible</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Job Description</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>

            {job.responsibilities && (
              <div>
                <h2 className="text-base font-bold text-slate-900">Responsibilities</h2>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {job.responsibilities}
                </p>
              </div>
            )}

            <div>
              <h2 className="text-base font-bold text-slate-900">Required Skills</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {job.required_skill_details?.map((skill) => (
                  <span
                    key={skill.id}
                    className="px-3 py-1 rounded-xl bg-slate-100 text-xs font-bold text-slate-700"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Application Form */}
          {isEligible && !alreadyApplied && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900">Submit Application</h2>
              <p className="text-xs text-slate-500">
                Your profile details and verified academic records will be sent to {job.company_details?.name}.
              </p>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Cover Note / Pitch (Optional)
                </label>
                <textarea
                  rows={3}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell the recruiter why you are a great fit..."
                  className="w-full text-sm p-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={handleApply}
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Confirm & Apply for this Role</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Sidebar: Eligibility Checklist */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Eligibility Verification
            </h3>

            {/* Reasons if ineligible */}
            {!isEligible && !alreadyApplied && reasons.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                <p className="font-bold">Ineligibility Notice:</p>
                {reasons.map((r, i) => (
                  <p key={i}>• {r}</p>
                ))}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-700 block">Min CGPA</span>
                  <span className="text-slate-400">Required: {job.minimum_cgpa}</span>
                </div>
                {checks.cgpa?.passed ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Passed
                  </span>
                ) : (
                  <span className="text-rose-600 font-bold flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> Failed
                  </span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-700 block">Eligible Branches</span>
                  <span className="text-slate-400">
                    {job.eligible_department_details?.map((d) => d.code).join(', ') || 'All'}
                  </span>
                </div>
                {checks.department?.passed ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Eligible
                  </span>
                ) : (
                  <span className="text-rose-600 font-bold flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> Ineligible
                  </span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-700 block">Max Backlogs</span>
                  <span className="text-slate-400">Allowed: {job.maximum_backlogs}</span>
                </div>
                {checks.backlogs?.passed ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Passed
                  </span>
                ) : (
                  <span className="text-rose-600 font-bold flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> Exceeded
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
