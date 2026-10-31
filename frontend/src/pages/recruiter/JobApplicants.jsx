import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  XCircle,
  Calendar,
  Award,
  ExternalLink,
  Eye,
  FileText,
  X
} from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import InterviewScheduleModal from '../../components/InterviewScheduleModal';
import { useToast } from '../../components/Toast';

export default function JobApplicants() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Preview Modal
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Interview Schedule Modal
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  const toast = useToast();

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const [jobRes, appsRes] = await Promise.all([
        api.get(`/jobs/${id}/`),
        api.get(`/applications/?job_id=${id}`),
      ]);
      setJob(jobRes.data);
      setApplications(appsRes.data.results || appsRes.data || []);
    } catch (err) {
      console.error('Failed to load applicants:', err);
      toast.error('Failed to load applicants.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [id]);

  const handleStatusUpdate = async (appId, newStatus) => {
    try {
      await api.post(`/applications/${appId}/update_status/`, { status: newStatus });
      toast.success(`Application marked as ${newStatus}. Candidate notified.`);
      fetchApplicants();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const handleOpenSchedule = (app) => {
    setSelectedApp(app);
    setScheduleModalOpen(true);
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading candidates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link
        to="/recruiter/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Job Postings</span>
      </Link>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Candidate Pipeline
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {job?.title} Applicants
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Total {applications.length} candidates applied meeting minimum criteria.
          </p>
        </div>
        <StatusBadge status={job?.status} />
      </div>

      {applications.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/80">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-700">No applicants yet for this position.</p>
          <p className="text-xs text-slate-400 mt-1">Check back once students discover this drive.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Branch & Roll</th>
                  <th className="px-6 py-4">CGPA</th>
                  <th className="px-6 py-4">Skills</th>
                  <th className="px-6 py-4">Applied Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {applications.map((app) => {
                  const student = app.student_details;
                  return (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">
                          {student?.user?.first_name} {student?.user?.last_name}
                        </p>
                        <p className="text-xs text-slate-400">{student?.user?.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-700">{student?.department_details?.code}</p>
                        <p className="text-xs text-slate-400">{student?.roll_number}</p>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-indigo-700">
                        {student?.cgpa}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {student?.skills?.slice(0, 3).map((s) => (
                            <span key={s.id} className="px-2 py-0.5 rounded-lg bg-slate-100 text-[10px] font-medium text-slate-600">
                              {s.skill_name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(app.applied_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-6 py-4 text-right space-x-1.5">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                          title="View Profile Details"
                        >
                          <Eye className="w-3.5 h-3.5 inline mr-1" /> Profile
                        </button>

                        {app.status === 'APPLIED' && (
                          <button
                            onClick={() => handleStatusUpdate(app.id, 'SHORTLISTED')}
                            className="px-2.5 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold"
                          >
                            Shortlist
                          </button>
                        )}

                        {(app.status === 'SHORTLISTED' || app.status === 'APPLIED') && (
                          <button
                            onClick={() => handleOpenSchedule(app)}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold shadow-sm"
                          >
                            <Calendar className="w-3.5 h-3.5 inline mr-1" /> Interview
                          </button>
                        )}

                        {app.status === 'INTERVIEW_SCHEDULED' && (
                          <button
                            onClick={() => handleStatusUpdate(app.id, 'SELECTED')}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold shadow-sm"
                          >
                            <Award className="w-3.5 h-3.5 inline mr-1" /> Offer / Select
                          </button>
                        )}

                        {app.status !== 'REJECTED' && app.status !== 'SELECTED' && (
                          <button
                            onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
                            className="px-2 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold"
                          >
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Profile Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {selectedStudent.user?.first_name} {selectedStudent.user?.last_name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Roll: {selectedStudent.roll_number} • {selectedStudent.department_details?.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <div>
                <p className="text-xs text-slate-400">CGPA</p>
                <p className="text-xl font-extrabold text-indigo-700">{selectedStudent.cgpa}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Backlogs</p>
                <p className="text-xl font-extrabold text-slate-800">{selectedStudent.backlogs}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Graduation</p>
                <p className="text-xl font-extrabold text-slate-800">{selectedStudent.graduation_year}</p>
              </div>
            </div>

            {selectedStudent.projects_info && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Projects</h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedStudent.projects_info}
                </p>
              </div>
            )}

            {selectedStudent.internships_info && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Internships</h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedStudent.internships_info}
                </p>
              </div>
            )}

            <div className="pt-2 flex flex-wrap gap-3">
              {selectedStudent.resume_url && (
                <a
                  href={selectedStudent.resume_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center gap-1.5 hover:bg-indigo-100"
                >
                  <FileText className="w-4 h-4" /> View Resume Link
                </a>
              )}
              {selectedStudent.github_url && (
                <a
                  href={selectedStudent.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-200"
                >
                  <ExternalLink className="w-4 h-4" /> GitHub
                </a>
              )}
              {selectedStudent.linkedin_url && (
                <a
                  href={selectedStudent.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs flex items-center gap-1.5 hover:bg-blue-100"
                >
                  <ExternalLink className="w-4 h-4" /> LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      <InterviewScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        application={selectedApp}
        onScheduled={() => {
          fetchApplicants();
        }}
      />
    </div>
  );
}
