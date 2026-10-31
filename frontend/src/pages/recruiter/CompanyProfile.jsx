import React, { useState, useEffect } from 'react';
import { Building2, Globe, Mail, MapPin, Save, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../components/Toast';

export default function CompanyProfile() {
  const [company, setCompany] = useState({
    name: '',
    description: '',
    industry: '',
    location: '',
    website: '',
    contact_person: '',
    contact_email: '',
    logo_url: '',
    approval_status: 'PENDING',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const res = await api.get('/companies/my_company/');
      if (res.data) setCompany(res.data);
    } catch (err) {
      console.log('No company profile yet or fetching error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const handleChange = (e) => {
    setCompany({ ...company, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.post('/recruiters/company-setup/', company);
      setCompany(res.data);
      toast.success('Company profile saved successfully!');
    } catch (err) {
      console.error('Failed to save company profile:', err);
      toast.error('Failed to save company profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading company information...</p>
      </div>
    );
  }

  const isApproved = company.approval_status === 'APPROVED';

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Employer Organization
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Company Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official company details visible to students and placement officers.
          </p>
        </div>
        <StatusBadge status={company.approval_status || 'PENDING'} />
      </div>

      {!isApproved && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <p className="font-bold">Pending Placement Cell Verification</p>
            <p className="mt-0.5">
              The placement officer reviews your company profile before new job openings become visible to students.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Company Name</label>
            <input
              type="text"
              required
              name="name"
              value={company.name}
              onChange={handleChange}
              placeholder="e.g. TechNova Solutions"
              className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Industry Sector</label>
            <input
              type="text"
              required
              name="industry"
              value={company.industry}
              onChange={handleChange}
              placeholder="e.g. Cloud Services, AI, FinTech"
              className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Company Overview</label>
          <textarea
            rows={3}
            name="description"
            value={company.description}
            onChange={handleChange}
            placeholder="Tell candidates about your engineering culture, mission, and products..."
            className="w-full text-sm p-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Headquarters / Location</label>
            <input
              type="text"
              required
              name="location"
              value={company.location}
              onChange={handleChange}
              placeholder="e.g. Bangalore, India"
              className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Official Website</label>
            <input
              type="url"
              name="website"
              value={company.website}
              onChange={handleChange}
              placeholder="https://company.example.com"
              className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Contact Person Name</label>
            <input
              type="text"
              name="contact_person"
              value={company.contact_person}
              onChange={handleChange}
              placeholder="e.g. Talent Acquisition Lead"
              className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Contact Email</label>
            <input
              type="email"
              required
              name="contact_email"
              value={company.contact_email}
              onChange={handleChange}
              placeholder="recruiting@company.example.com"
              className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Company Logo URL</label>
          <input
            type="url"
            name="logo_url"
            value={company.logo_url}
            onChange={handleChange}
            placeholder="https://example.com/logo.png"
            className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Company Details</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
