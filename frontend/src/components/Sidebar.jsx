import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  UserCheck,
  Briefcase,
  FileText,
  Calendar,
  Building2,
  Users,
  FileSpreadsheet,
  BarChart3,
  Bell,
  LogOut,
  PlusCircle,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const studentLinks = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/profile', icon: UserCheck, label: 'My Profile' },
    { to: '/student/jobs', icon: Briefcase, label: 'Available Jobs' },
    { to: '/student/applications', icon: FileText, label: 'My Applications' },
    { to: '/student/interviews', icon: Calendar, label: 'Interviews' },
    { to: '/student/notifications', icon: Bell, label: 'Notifications' },
  ];

  const recruiterLinks = [
    { to: '/recruiter/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/recruiter/company', icon: Building2, label: 'Company Profile' },
    { to: '/recruiter/jobs/new', icon: PlusCircle, label: 'Post a Job' },
    { to: '/recruiter/jobs', icon: Briefcase, label: 'My Job Postings' },
    { to: '/recruiter/interviews', icon: Calendar, label: 'Interviews' },
    { to: '/recruiter/notifications', icon: Bell, label: 'Notifications' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/admin/students', icon: Users, label: 'Student Directory' },
    { to: '/admin/companies', icon: Building2, label: 'Companies' },
    { to: '/admin/jobs', icon: Briefcase, label: 'Job Postings' },
    { to: '/admin/applications', icon: FileSpreadsheet, label: 'Applications' },
    { to: '/admin/interviews', icon: Calendar, label: 'Interviews' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Placement Analytics' },
    { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
  ];

  const links = role === 'ADMIN' ? adminLinks : role === 'RECRUITER' ? recruiterLinks : studentLinks;

  const roleLabel =
    role === 'ADMIN' ? 'Placement Officer' : role === 'RECRUITER' ? 'Recruiter' : 'Student Candidate';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-white text-lg tracking-tight">
                Campus<span className="text-indigo-400">Connect</span>
              </span>
              <span className="block text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
                {roleLabel}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Navigation Menu
          </p>
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User bar & Sign out */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-sm font-bold text-white truncate">
                  {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
