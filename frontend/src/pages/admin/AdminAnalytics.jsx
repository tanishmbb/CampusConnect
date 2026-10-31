import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import {
  TrendingUp,
  Award,
  Users,
  Briefcase,
  Building2,
  DollarSign,
  PieChart as PieIcon,
  BarChart3
} from 'lucide-react';
import api from '../../api/client';
import StatCard from '../../components/StatCard';
import { useToast } from '../../components/Toast';

const STATUS_COLORS = {
  Applied: '#3b82f6',
  'Under Review': '#f59e0b',
  Shortlisted: '#8b5cf6',
  'Interview Scheduled': '#6366f1',
  'Selected / Placed': '#10b981',
  Rejected: '#ef4444',
};

const PIE_COLORS = ['#10b981', '#64748b'];

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/admin/');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
        toast.error('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-500">Calculating placement analytics...</p>
      </div>
    );
  }

  const overview = data?.overview || {};
  const deptData = data?.department_placements || [];
  const compData = data?.company_selections || [];
  const statusData = data?.status_distribution || [];
  const salaryData = data?.salary_distribution || [];
  const yearTrends = data?.year_trends || [];

  const placedPieData = [
    { name: 'Placed Students', value: overview.placed_students || 0 },
    { name: 'Not Placed', value: overview.not_placed_students || 0 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Placement Analytics & Reporting Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Dynamic metrics and visual breakdown computed live from active database records.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Placement Percentage"
          value={`${overview.placement_percentage}%`}
          subtitle={`${overview.placed_students} of ${overview.total_students} Placed`}
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Eligible Students"
          value={overview.eligible_students}
          subtitle="CGPA ≥ 6.0 & 0 Backlogs"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Average CTC Package"
          value={`₹${overview.average_package} LPA`}
          subtitle={`Lowest: ₹${overview.lowest_package} LPA`}
          icon={TrendingUp}
          color="amber"
        />
        <StatCard
          title="Highest CTC Package"
          value={`₹${overview.highest_package} LPA`}
          subtitle="Top Tier Hiring Offer"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Row 1 Charts: Department Placements & Placed vs Not Placed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dept Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Department-wise Placements</h2>
              <p className="text-xs text-slate-400">Total enrolled students vs successfully placed</p>
            </div>
            <BarChart3 className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="code" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="total_students" name="Total Students" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="placed_students" name="Placed Students" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Placed vs Not Placed Donut */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Placement Ratio</h2>
            <p className="text-xs text-slate-400">Batch of 2026 conversion</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={placedPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {placedPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-slate-100">
            <div>
              <span className="text-xs text-slate-400 block font-bold">Placed</span>
              <span className="text-lg font-extrabold text-emerald-600">{overview.placed_students}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-bold">In Pipeline</span>
              <span className="text-lg font-extrabold text-slate-600">{overview.not_placed_students}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2 Charts: Application Status Distribution & Salary Package Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Application Status Funnel</h2>
            <p className="text-xs text-slate-400">Distribution across active hiring phases</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statusData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis dataKey="status" type="category" tick={{ fontSize: 11, fill: '#475569' }} width={110} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Applications" fill="#6366f1" radius={[0, 6, 6, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Salary Package Range Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Salary Package Distribution (LPA)</h2>
            <p className="text-xs text-slate-400">Compensation tier breakdown among open roles</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Job Drives" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Top Hiring Companies */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Top Hiring Partners by Selections</h2>
          <p className="text-xs text-slate-400">Companies extending the highest volume of campus offers</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={compData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="selected_count" name="Offers Extended" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="jobs_count" name="Active Drives" fill="#c4b5fd" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
