import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Briefcase, ArrowLeft, Save, Send, Plus, X, AlertCircle } from 'lucide-react';
import api from '../../api/client';
import { useToast } from '../../components/Toast';

export default function PostJob() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    responsibilities: '',
    location: '',
    salary_min: '8.00',
    salary_max: '14.00',
    job_type: 'FULL_TIME',
    minimum_cgpa: '7.0',
    eligible_department_ids: [],
    graduation_year: 2026,
    maximum_backlogs: 0,
    application_deadline: '',
    required_skill_names: ['Python', 'Django', 'React'],
  });

  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const deptRes = await api.get('/students/departments/');
        setDepartments(deptRes.data || []);

        if (isEditing) {
          const jobRes = await api.get(`/jobs/${id}/`);
          const job = jobRes.data;
          setFormData({
            title: job.title,
            description: job.description,
            responsibilities: job.responsibilities || '',
            location: job.location,
            salary_min: job.salary_min,
            salary_max: job.salary_max,
            job_type: job.job_type,
            minimum_cgpa: job.minimum_cgpa,
            eligible_department_ids: job.eligible_departments || [],
            graduation_year: job.graduation_year,
            maximum_backlogs: job.maximum_backlogs,
            application_deadline: job.application_deadline,
            required_skill_names: (job.required_skill_details || []).map((s) => s.name),
          });
        } else {
          // Default all departments checked
          setFormData((prev) => ({
            ...prev,
            eligible_department_ids: (deptRes.data || []).map((d) => d.id),
          }));
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
        toast.error('Failed to load departments or job data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEditing]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDeptToggle = (deptId) => {
    const current = [...formData.eligible_department_ids];
    if (current.includes(deptId)) {
      setFormData({
        ...formData,
        eligible_department_ids: current.filter((i) => i !== deptId),
      });
    } else {
      setFormData({
        ...formData,
        eligible_department_ids: [...current, deptId],
      });
    }
  };

  const handleAddSkill = () => {
    const val = skillInput.trim();
    if (val && !formData.required_skill_names.includes(val)) {
      setFormData({
        ...formData,
        required_skill_names: [...formData.required_skill_names, val],
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData({
      ...formData,
      required_skill_names: formData.required_skill_names.filter((s) => s !== skill),
    });
  };

  const handleSave = async (submitStatus) => {
    if (!formData.title || !formData.description || !formData.application_deadline) {
      toast.error('Please fill in title, description, and application deadline.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        status: submitStatus,
      };

      if (isEditing) {
        await api.put(`/jobs/${id}/`, payload);
        toast.success('Job posting updated successfully!');
      } else {
        await api.post('/jobs/', payload);
        toast.success(
          submitStatus === 'DRAFT'
            ? 'Job saved as draft.'
            : 'Job submitted for Placement Cell approval!'
        );
      }
      navigate('/recruiter/jobs');
    } catch (err) {
      console.error('Failed to save job:', err);
      toast.error('Failed to save job. Please verify all inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading form setup...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <Link
        to="/recruiter/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Job Postings</span>
      </Link>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
          Campus Drive Publishing
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          {isEditing ? 'Edit Job Opening' : 'Post New Campus Job Opportunity'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Specify role expectations, compensation, and automated eligibility criteria.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Job Title</label>
          <input
            type="text"
            required
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Python Full Stack Developer, Data Analyst"
            className="w-full text-sm p-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Job Description</label>
          <textarea
            rows={4}
            required
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Overview of the position, day-to-day work, engineering team stack..."
            className="w-full text-sm p-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Key Responsibilities</label>
          <textarea
            rows={3}
            name="responsibilities"
            value={formData.responsibilities}
            onChange={handleChange}
            placeholder="Bullet points of key engineering milestones or tasks..."
            className="w-full text-sm p-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Job Type</label>
            <select
              name="job_type"
              value={formData.job_type}
              onChange={handleChange}
              className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="PART_TIME">Part Time</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Location / Work Mode</label>
            <input
              type="text"
              required
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Bangalore / Hybrid"
              className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Application Deadline</label>
            <input
              type="date"
              required
              name="application_deadline"
              value={formData.application_deadline}
              onChange={handleChange}
              className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Salary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Min Salary (LPA)</label>
            <input
              type="number"
              step="0.5"
              required
              name="salary_min"
              value={formData.salary_min}
              onChange={handleChange}
              placeholder="e.g. 8.0"
              className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Max Salary (LPA)</label>
            <input
              type="number"
              step="0.5"
              required
              name="salary_max"
              value={formData.salary_max}
              onChange={handleChange}
              placeholder="e.g. 14.0"
              className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white font-bold text-emerald-700"
            />
          </div>
        </div>

        {/* Eligibility Criteria */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Student Eligibility Verification Rules</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Minimum CGPA (0-10)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                name="minimum_cgpa"
                value={formData.minimum_cgpa}
                onChange={handleChange}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Graduation Batch</label>
              <input
                type="number"
                name="graduation_year"
                value={formData.graduation_year}
                onChange={handleChange}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Max Allowed Backlogs</label>
              <input
                type="number"
                min="0"
                name="maximum_backlogs"
                value={formData.maximum_backlogs}
                onChange={handleChange}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-2">Eligible Departments / Branches</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {departments.map((dept) => {
                const checked = formData.eligible_department_ids.includes(dept.id);
                return (
                  <label
                    key={dept.id}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold cursor-pointer transition ${
                      checked
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleDeptToggle(dept.id)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{dept.code}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Required Skills */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold uppercase text-slate-600">Required Skills</label>
          <div className="flex flex-wrap gap-2">
            {formData.required_skill_names.map((skill, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-rose-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 max-w-sm">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="e.g. React, SQL"
              className="flex-1 text-sm p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSave('DRAFT')}
            className="px-6 py-3 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Draft</span>
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSave('PENDING_APPROVAL')}
            className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Submit for Approval</span>
          </button>
        </div>
      </div>
    </div>
  );
}
