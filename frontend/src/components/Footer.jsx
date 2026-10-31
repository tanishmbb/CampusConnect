import React from 'react';
import { GraduationCap, Heart, Github, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Campus<span className="text-indigo-400">Connect</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed max-w-md text-slate-400">
              A centralized placement management platform connecting students, university recruiters, and placement officers. Designed and engineered for production-ready campus hiring operations.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Python Full Stack Internship Project • 2026</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Portals</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-white transition">Student Portal</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Recruiter Portal</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Placement Officer Portal</Link></li>
              <li><Link to="/explore-jobs" className="hover:text-white transition">Explore Open Roles</Link></li>
            </ul>
          </div>

          {/* Technology stack */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Tech Architecture</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• Python 3 & Django 6 REST Framework</li>
              <li>• JWT Token Authentication (SimpleJWT)</li>
              <li>• React 18 + Vite + Tailwind CSS</li>
              <li>• MySQL / SQLite Dual Data Engine</li>
              <li>• Recharts Analytics Engine</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CampusConnect. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for Academic Review & Viva Demonstration
          </p>
        </div>
      </div>
    </footer>
  );
}
