import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, MapPin, User, Building2, ExternalLink } from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';

export default function AdminInterviews() {
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
        <p className="text-sm font-medium text-slate-500">Loading scheduled rounds...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Campus Interview Schedule Master
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor all technical, HR, online, and campus interview sessions across companies.
        </p>
      </div>

      {interviews.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/80">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-700">No interviews currently scheduled.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Company & Role</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Round Type</th>
                  <th className="px-6 py-4">Location / Meeting Link</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {interviews.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{inv.student_name}</p>
                      <p className="text-xs text-slate-400">{inv.student_roll}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{inv.job_title}</p>
                      <p className="text-xs text-indigo-600 font-semibold">{inv.company_name}</p>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <p className="font-bold text-slate-800">{inv.interview_date}</p>
                      <p className="text-slate-400">{inv.interview_time}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={inv.interview_type} size="xs" />
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {inv.location_or_link?.startsWith('http') ? (
                        <a
                          href={inv.location_or_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline flex items-center gap-1 font-bold"
                        >
                          <Video className="w-3.5 h-3.5" /> Meeting Link
                        </a>
                      ) : (
                        <span className="text-slate-600 flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {inv.location_or_link}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={inv.status} />
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
