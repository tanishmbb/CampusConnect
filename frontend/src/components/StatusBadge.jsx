import React from 'react';

const statusStyles = {
  // Application statuses
  APPLIED: 'bg-blue-50 text-blue-700 border-blue-200',
  UNDER_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
  SHORTLISTED: 'bg-purple-50 text-purple-700 border-purple-200',
  INTERVIEW_SCHEDULED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  SELECTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',

  // Job statuses
  DRAFT: 'bg-slate-100 text-slate-700 border-slate-200',
  PENDING_APPROVAL: 'bg-amber-50 text-amber-700 border-amber-200',
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CLOSED: 'bg-zinc-100 text-zinc-600 border-zinc-300',

  // Company statuses
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',

  // Placement status
  PLACED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  NOT_PLACED: 'bg-slate-100 text-slate-600 border-slate-200',

  // Interview types
  ONLINE: 'bg-sky-50 text-sky-700 border-sky-200',
  OFFLINE: 'bg-orange-50 text-orange-700 border-orange-200',
  TECHNICAL: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  HR: 'bg-pink-50 text-pink-700 border-pink-200',
};

const statusLabels = {
  APPLIED: 'Applied',
  UNDER_REVIEW: 'Under Review',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW_SCHEDULED: 'Interview Scheduled',
  SELECTED: 'Selected / Placed',
  REJECTED: 'Rejected',
  DRAFT: 'Draft',
  PENDING_APPROVAL: 'Pending Approval',
  ACTIVE: 'Active',
  CLOSED: 'Closed',
  PENDING: 'Pending',
  APPROVED: 'Approved',
  PLACED: 'Placed ✓',
  NOT_PLACED: 'Not Placed',
  ONLINE: 'Online Video Call',
  OFFLINE: 'On-Campus / In-Person',
  TECHNICAL: 'Technical Round',
  HR: 'HR Round',
};

export default function StatusBadge({ status, label, size = 'sm' }) {
  const normalized = (status || '').toUpperCase();
  const style = statusStyles[normalized] || 'bg-slate-50 text-slate-600 border-slate-200';
  const text = label || statusLabels[normalized] || status;

  const sizeClass = size === 'xs' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${sizeClass} ${style}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
      {text}
    </span>
  );
}
