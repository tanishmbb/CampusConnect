import React, { useState } from 'react';
import { Calendar, Clock, Video, MapPin, X, Check } from 'lucide-react';
import api from '../api/client';
import { useToast } from './Toast';

export default function InterviewScheduleModal({ isOpen, onClose, application, onScheduled }) {
  const [formData, setFormData] = useState({
    interview_date: '',
    interview_time: '10:00:00',
    interview_type: 'ONLINE',
    location_or_link: 'https://meet.google.com/campus-interview',
    interviewer: 'Technical Hiring Panel',
    notes: 'Please review fundamental algorithmic concepts and have your project demo ready.',
  });
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  if (!isOpen || !application) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.interview_date) {
      toast.error('Please specify an interview date.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/interviews/', {
        application_id: application.id,
        ...formData,
      });
      toast.success('Interview scheduled! Candidate has been notified.');
      if (onScheduled) onScheduled();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to schedule interview.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 lg:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Schedule Interview</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Candidate: {application.student_details?.user?.first_name} {application.student_details?.user?.last_name} ({application.student_details?.roll_number})
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Interview Date</label>
              <input
                type="date"
                required
                value={formData.interview_date}
                onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Time</label>
              <input
                type="time"
                required
                value={formData.interview_time}
                onChange={(e) => setFormData({ ...formData, interview_time: e.target.value })}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Round / Type</label>
            <select
              value={formData.interview_type}
              onChange={(e) => setFormData({ ...formData, interview_type: e.target.value })}
              className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="ONLINE">Online Video Call</option>
              <option value="TECHNICAL">Technical Round</option>
              <option value="HR">HR Round</option>
              <option value="OFFLINE">On-Campus / In-Person</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Meeting Link or Location</label>
            <input
              type="text"
              required
              value={formData.location_or_link}
              onChange={(e) => setFormData({ ...formData, location_or_link: e.target.value })}
              placeholder="e.g. https://meet.google.com/xyz or Placement Hall Room 204"
              className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Interviewer Name / Panel</label>
            <input
              type="text"
              value={formData.interviewer}
              onChange={(e) => setFormData({ ...formData, interviewer: e.target.value })}
              placeholder="e.g. Lead Engineer, VP Product"
              className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Preparation Notes for Candidate</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Scheduling...' : 'Confirm Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
