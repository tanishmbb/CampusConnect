import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, UserCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'STUDENT') return '/student/dashboard';
    if (user.role === 'RECRUITER') return '/recruiter/dashboard';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    return '/';
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                Campus<span className="text-indigo-600">Connect</span>
              </span>
              <span className="hidden sm:block text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Placement Portal
              </span>
            </div>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="/#features" className="hover:text-indigo-600 transition">Features</a>
            <a href="/#how-it-works" className="hover:text-indigo-600 transition">How It Works</a>
            <a href="/#companies" className="hover:text-indigo-600 transition">Companies</a>
            <Link to="/explore-jobs" className="hover:text-indigo-600 transition">Browse Jobs</Link>
            <a href="/#faq" className="hover:text-indigo-600 transition">FAQ</a>
          </div>

          {/* Auth Action */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to={getDashboardPath()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-sm transition"
                >
                  <UserCircle2 className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-rose-600 px-3 py-2 transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 transition hover:scale-105 transform active:scale-95"
                >
                  <span>Register</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
