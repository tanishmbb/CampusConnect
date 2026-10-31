import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  Briefcase,
  Link as LinkIcon,
  Save,
  CheckCircle2,
  Plus,
  X,
  Sparkles
} from 'lucide-react';
import api from '../../api/client';
import { useToast } from '../../components/Toast';

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [skillsList, setSkillsList] = useState([]);
  const toast = useToast();

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [profRes, deptRes] = await Promise.all([
        api.get('/students/profile/'),
        api.get('/students/departments/'),
      ]);
      setProfile(profRes.data);
      setDepartments(deptRes.data || []);
      const existing = (profRes.data.skills || []).map((s) => s.skill_name);
      setSkillsList(existing);
    } catch (err) {
      console.error('Failed to load profile:', err);
      toast.error('Could not load student profile data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skillsList.includes(trimmed)) {
      setSkillsList([...skillsList, trimmed]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkillsList(skillsList.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        roll_number: profile.roll_number,
        phone: profile.phone,
        date_of_birth: profile.date_of_birth || null,
        gender: profile.gender,
        address: profile.address,
        department_id: profile.department_id || profile.department_details?.id,
        graduation_year: profile.graduation_year,
        cgpa: profile.cgpa,
        tenth_percentage: profile.tenth_percentage,
        twelfth_percentage: profile.twelfth_percentage,
        diploma_percentage: profile.diploma_percentage || null,
        backlogs: profile.backlogs,
        resume_url: profile.resume_url,
        github_url: profile.github_url,
        linkedin_url: profile.linkedin_url,
        projects_info: profile.projects_info,
        internships_info: profile.internships_info,
        certifications_info: profile.certifications_info,
        skills_list: skillsList,
      };

      const res = await api.put('/students/profile/', payload);
      setProfile(res.data);
      toast.success('Profile updated successfully! Completion score recalculated.');
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error('Failed to update profile. Please verify your inputs.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading student profile...</p>
      </div>
    );
  }

  const completion = profile?.profile_completion || 25;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header & Completion card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Candidate Credentials
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Student Profile Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Keep your academic data and contact details up-to-date for eligibility verification.
          </p>
        </div>

        <div className="w-full md:w-72 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col gap-2 flex-shrink-0">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-indigo-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Profile Completion
            </span>
            <span className="text-indigo-700">{completion}%</span>
          </div>
          <div className="w-full bg-indigo-200/70 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>
          <p className="text-[11px] text-indigo-700/80">
            {completion < 75
              ? 'Add skills, resume link, and social profiles to boost your score.'
              : 'Great job! Your profile meets top recruiter requirements.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Personal Information */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
              <p className="text-xs text-slate-400">Basic identification and contact information</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value={`${profile?.user?.first_name || ''} ${profile?.user?.last_name || ''}`}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Email</label>
              <input
                type="email"
                disabled
                value={profile?.user?.email || ''}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Roll Number / USN</label>
              <input
                type="text"
                required
                name="roll_number"
                value={profile?.roll_number || ''}
                onChange={handleChange}
                placeholder="e.g. 22CS1001"
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Contact Phone</label>
              <input
                type="text"
                name="phone"
                value={profile?.phone || ''}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={profile?.date_of_birth || ''}
                onChange={handleChange}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Gender</label>
              <select
                name="gender"
                value={profile?.gender || 'MALE'}
                onChange={handleChange}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Current Address</label>
            <textarea
              rows={2}
              name="address"
              value={profile?.address || ''}
              onChange={handleChange}
              placeholder="Enter current campus or residential address"
              className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Section 2: Academic Information */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Academic Information</h2>
              <p className="text-xs text-slate-400">Used by company eligibility engines</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Department / Branch</label>
              <select
                name="department_id"
                value={profile?.department_id || profile?.department_details?.id || ''}
                onChange={handleChange}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Graduation Batch</label>
              <input
                type="number"
                name="graduation_year"
                value={profile?.graduation_year || 2026}
                onChange={handleChange}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Current CGPA (Scale 10)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                required
                name="cgpa"
                value={profile?.cgpa || 0}
                onChange={handleChange}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">10th Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                name="tenth_percentage"
                value={profile?.tenth_percentage || 0}
                onChange={handleChange}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">12th Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                name="twelfth_percentage"
                value={profile?.twelfth_percentage || 0}
                onChange={handleChange}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Diploma % (if any)</label>
              <input
                type="number"
                step="0.1"
                name="diploma_percentage"
                value={profile?.diploma_percentage || ''}
                onChange={handleChange}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Active Backlogs</label>
              <input
                type="number"
                min="0"
                name="backlogs"
                value={profile?.backlogs ?? 0}
                onChange={handleChange}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-bold text-rose-600"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Technical Skills */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Skills & Competencies</h2>
              <p className="text-xs text-slate-400">Match with required job tags</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {skillsList.map((skill, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100"
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

          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="e.g. React, Docker, Python"
              className="flex-1 text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
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
              className="px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>

        {/* Section 4: Projects, Internships, Certifications */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
            Experience & Credentials
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Key Projects</label>
              <textarea
                rows={2}
                name="projects_info"
                value={profile?.projects_info || ''}
                onChange={handleChange}
                placeholder="Mention major college and personal projects..."
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Prior Internships</label>
              <textarea
                rows={2}
                name="internships_info"
                value={profile?.internships_info || ''}
                onChange={handleChange}
                placeholder="Company, role, duration, and key contributions..."
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Certifications</label>
              <textarea
                rows={2}
                name="certifications_info"
                value={profile?.certifications_info || ''}
                onChange={handleChange}
                placeholder="AWS Certified, Oracle Java, Coursera..."
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Resume & Links */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <LinkIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Resume & Online Portfolios</h2>
              <p className="text-xs text-slate-400">Accessible to prospective recruiters</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Resume Link (PDF / Drive)</label>
              <input
                type="url"
                name="resume_url"
                value={profile?.resume_url || ''}
                onChange={handleChange}
                placeholder="https://drive.google.com/file/..."
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">GitHub Profile</label>
              <input
                type="url"
                name="github_url"
                value={profile?.github_url || ''}
                onChange={handleChange}
                placeholder="https://github.com/username"
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">LinkedIn Profile</label>
              <input
                type="url"
                name="linkedin_url"
                value={profile?.linkedin_url || ''}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-200 transition flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save & Recalculate Profile</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
