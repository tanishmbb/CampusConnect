import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, MapPin, User, ExternalLink } from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';

export default function RecruiterInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        const res = await api.get('/interviews/');
        setInterviews(res.data.results || res.data || []);
      } catch (err) {
        console.error('Failed to load interviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading interview rounds...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Scheduled Candidate Interviews
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review upcoming candidate evaluation panels and conference links.
        </p>
      </div>

      {interviews.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/80">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-700">No interviews currently scheduled.</p>
          <p className="text-xs text-slate-400 mt-1">
            Shortlist applicants from your job drives to schedule interviews.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {interviews.map((inv) => (
            <div
              key={inv.id}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                      {inv.job_title}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">{inv.student_name}</h3>
                    <p className="text-xs text-slate-400">Roll: {inv.student_roll}</p>
                  </div>
                  <StatusBadge status={inv.interview_type} size="xs" />
                </div>

                <div className="mt-5 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span className="font-bold text-slate-800">
                      {new Date(inv.interview_date).toLocaleDateString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Time: <strong>{inv.interview_time}</strong></span>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Meeting Link / Location
                    </p>
                    {inv.location_or_link?.startsWith('http') ? (
                      <a
                        href={inv.location_or_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 underline break-all"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Open Video Conference</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{inv.location_or_link}</span>
                      </div>
                    )}
                  </div>

                  {inv.notes && (
                    <p className="text-xs text-slate-500 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/40">
                      <strong>Panel Notes:</strong> {inv.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <StatusBadge status={inv.status} size="xs" />
                <span className="text-[11px] text-slate-400">Interviewer: {inv.interviewer || 'Hiring Panel'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
