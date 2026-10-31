import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  Calendar,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Send,
  GraduationCap
} from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import EligibilityModal from '../../components/EligibilityModal';
import { useToast } from '../../components/Toast';

export default function JobSearch() {
  const [jobs, setJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Eligibility modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [eligibilityData, setEligibilityData] = useState(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  const toast = useToast();

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = { page };
      if (search) params.search = search;
      if (selectedDept) params.department = selectedDept;
      if (location) params.location = location;
      if (jobType) params.job_type = jobType;
      if (minSalary) params.min_salary = minSalary;

      const res = await api.get('/jobs/', { params });
      if (res.data.results) {
        setJobs(res.data.results);
        setTotalPages(Math.ceil(res.data.count / 10) || 1);
      } else {
        setJobs(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
      toast.error('Failed to load job listings.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/students/departments/');
      setDepartments(res.data || []);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [selectedDept, jobType, page, location, minSalary]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const handleOpenEligibility = async (job) => {
    setSelectedJob(job);
    setCheckingEligibility(true);
    try {
      const res = await api.get(`/jobs/${job.id}/eligibility/`);
      setEligibilityData(res.data);
      setModalOpen(true);
    } catch (err) {
      toast.error('Failed to evaluate eligibility.');
    } finally {
      setCheckingEligibility(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Campus Recruitment Drives
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore approved roles and verify your eligibility with one click.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Job title, company, skills..."
              className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={selectedDept}
              onChange={(e) => { setSelectedDept(e.target.value); setPage(1); }}
              className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.code}>{d.code}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={jobType}
              onChange={(e) => { setJobType(e.target.value); setPage(1); }}
              className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Job Types</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="PART_TIME">Part Time</option>
            </select>
          </div>

          <div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City (e.g. Bangalore)"
              className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </form>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Retrieving opportunities...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/80">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-700">No active jobs found.</p>
          <p className="text-xs text-slate-400 mt-1">Try broadening your search or department filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                      {job.company_details?.name}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">{job.title}</h3>
                  </div>
                  <StatusBadge status={job.job_type} size="xs" />
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-emerald-700">
                    <span>₹{job.salary_min} - ₹{job.salary_max} LPA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    <span>Min CGPA: <strong>{job.minimum_cgpa}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-rose-600">
                    <Calendar className="w-3.5 h-3.5 text-rose-400" />
                    <span>Deadline: {job.application_deadline}</span>
                  </div>
                </div>

                {/* Skills Chips */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {job.required_skill_details?.slice(0, 4).map((s) => (
                    <span
                      key={s.id}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 text-[11px] font-medium text-slate-600"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  to={`/student/jobs/${job.id}`}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </Link>
                <button
                  onClick={() => handleOpenEligibility(job)}
                  disabled={checkingEligibility}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Apply Now</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs font-bold text-slate-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Eligibility & Apply Modal */}
      <EligibilityModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        job={selectedJob}
        eligibilityData={eligibilityData}
        onApplied={() => {
          fetchJobs();
        }}
      />
    </div>
  );
}
