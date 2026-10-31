import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, X, Send } from 'lucide-react';
import api from '../api/client';
import { useToast } from './Toast';

export default function EligibilityModal({ isOpen, onClose, job, eligibilityData, onApplied }) {
  const [submitting, setSubmitting] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const toast = useToast();

  if (!isOpen || !job) return null;

  const isEligible = eligibilityData?.is_eligible;
  const alreadyApplied = eligibilityData?.already_applied;
  const checks = eligibilityData?.checks || {};
  const reasons = eligibilityData?.reasons || [];

  const handleApply = async () => {
    try {
      setSubmitting(true);
      await api.post('/applications/', {
        job_id: job.id,
        cover_letter: coverLetter,
      });
      toast.success(`Successfully applied for ${job.title}!`);
      if (onApplied) onApplied();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.non_field_errors?.[0] ||
                  err.response?.data?.detail ||
                  'Failed to submit application. Please check requirements.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 lg:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Application Eligibility Check</h3>
            <p className="text-sm text-slate-500 mt-0.5">{job.title} • {job.company_details?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status banner */}
        <div className="mt-5">
          {alreadyApplied ? (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-900">Already Applied</p>
                <p className="text-xs text-blue-700 mt-0.5">You have already submitted your application for this position.</p>
              </div>
            </div>
          ) : isEligible ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-900">Eligible to Apply ✓</p>
                <p className="text-xs text-emerald-700 mt-0.5">You satisfy all academic, department, and backlog criteria for this role.</p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
              <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-rose-900">Not Eligible</p>
                <ul className="text-xs text-rose-700 mt-1 list-disc list-inside space-y-0.5">
                  {reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Detailed checks list */}
        <div className="mt-6 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Criteria Breakdown</p>

          {/* CGPA */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm">
            <div>
              <p className="font-medium text-slate-700">Minimum CGPA</p>
              <p className="text-xs text-slate-400">Required: {checks.cgpa?.required} | Your CGPA: {checks.cgpa?.actual}</p>
            </div>
            {checks.cgpa?.passed ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Passed
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                <XCircle className="w-3.5 h-3.5" /> Below Req.
              </span>
            )}
          </div>

          {/* Department */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm">
            <div>
              <p className="font-medium text-slate-700">Eligible Department</p>
              <p className="text-xs text-slate-400">Your Branch: {checks.department?.actual}</p>
            </div>
            {checks.department?.passed ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Matched
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                <XCircle className="w-3.5 h-3.5" /> Ineligible
              </span>
            )}
          </div>

          {/* Backlogs */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm">
            <div>
              <p className="font-medium text-slate-700">Maximum Backlogs</p>
              <p className="text-xs text-slate-400">Allowed: {checks.backlogs?.max_allowed} | Your Backlogs: {checks.backlogs?.actual}</p>
            </div>
            {checks.backlogs?.passed ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Passed
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                <XCircle className="w-3.5 h-3.5" /> Exceeded
              </span>
            )}
          </div>
        </div>

        {/* Application submission form if eligible */}
        {isEligible && !alreadyApplied && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Cover Note / Why hire you? (Optional)
            </label>
            <textarea
              rows={3}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Highlight relevant projects, technologies, and enthusiasm for this role..."
              className="w-full text-sm p-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleApply}
              disabled={submitting}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Confirm & Submit Application
                </>
              )}
            </button>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="text-sm font-semibold text-slate-500 hover:text-slate-800 px-4 py-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
