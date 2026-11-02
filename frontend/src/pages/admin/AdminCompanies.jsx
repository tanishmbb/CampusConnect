import React, { useState, useEffect } from 'react';
import {
  Building2,
  CheckCircle2,
  XCircle,
  MapPin,
  Globe,
  Mail,
  Search,
  ExternalLink
} from 'lucide-react';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../components/Toast';

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const toast = useToast();

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/companies/');
      setCompanies(res.data.results || res.data || []);
    } catch (err) {
      console.error('Failed to load companies:', err);
      toast.error('Failed to load companies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.post(`/companies/${id}/approve/`);
      toast.success('Company approved.');
      fetchCompanies();
    } catch (err) {
      toast.error('Failed to approve company.');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(`/companies/${id}/reject/`);
      toast.info('Company rejected.');
      fetchCompanies();
    } catch (err) {
      toast.error('Failed to reject company.');
    }
  };

  const filtered = companies.filter((c) =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.industry || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.location || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Corporate Partner Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review, approve, and verify hiring organizations participating in campus drives.
        </p>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by company name, industry, or location..."
          className="w-full text-sm py-1 focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Loading partner companies...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/80">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-700">No companies found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Industry</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Drives Posted</th>
                  <th className="px-6 py-4">Students Placed</th>
                  <th className="px-6 py-4">Approval Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((company) => (
                  <tr key={company.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-sm shadow-sm">
                          {company.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{company.name}</p>
                          <p className="text-xs text-slate-400">{company.contact_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-semibold">
                      {company.industry}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{company.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-indigo-700">
                      {company.jobs_count || 0}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-700">
                      {company.selected_students_count || 0}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={company.approval_status} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {company.approval_status !== 'APPROVED' && (
                        <button
                          onClick={() => handleApprove(company.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
                        >
                          Approve
                        </button>
                      )}
                      {company.approval_status !== 'REJECTED' && (
                        <button
                          onClick={() => handleReject(company.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition"
                        >
                          Reject
                        </button>
                      )}
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
