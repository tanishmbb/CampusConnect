import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Building2,
  Briefcase,
  ShieldCheck,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export default function LandingPage() {
  const partnerCompanies = [
    { name: 'TechNova Solutions', industry: 'Cloud & Enterprise', location: 'Bangalore' },
    { name: 'DataBridge Systems', industry: 'AI & Data Platforms', location: 'Hyderabad' },
    { name: 'CloudCore Technologies', industry: 'DevOps & Cloud', location: 'Pune' },
    { name: 'InnovateLabs', industry: 'GenAI & SaaS', location: 'Gurgaon' },
    { name: 'NextGen Software', industry: 'FinTech Systems', location: 'Chennai' },
  ];

  const steps = [
    { num: '01', title: 'Profile & Verification', desc: 'Students create digital profiles with verified CGPA, department, skills and dynamic completion score.' },
    { num: '02', title: 'Company & Job Posting', desc: 'Recruiters register company profiles and publish job opportunities with granular eligibility criteria.' },
    { num: '03', title: 'Eligibility Engine & Apply', desc: 'Instant rule verification checks CGPA, backlogs, branch and deadline before 1-click submission.' },
    { num: '04', title: 'Interviews & Offer Letters', desc: 'Placement cells and recruiters schedule multi-round interviews and issue offers with live analytics.' },
  ];

  const faqs = [
    { q: 'How does CampusConnect verify student eligibility for job drives?', a: 'The system has an automated eligibility check engine that compares the student\'s live CGPA, branch/department, current active backlogs, and graduation year against the recruiter\'s prerequisites before permitting application submission.' },
    { q: 'Can a recruiter post jobs immediately after sign up?', a: 'To guarantee quality and student safety, corporate recruiter profiles and their company registrations are first verified and approved by the Placement Officer / Admin before their job postings go live.' },
    { q: 'How are interview rounds coordinated?', a: 'Recruiters can schedule Technical, HR, Online, or On-Campus interview slots directly through the portal. Students immediately receive real-time notifications and can view the meeting link/room venue in their Interview Calendar.' },
    { q: 'What happens when a student receives an offer?', a: 'Once marked as SELECTED by a recruiter, the student\'s status transitions to PLACED in real-time, locking out duplicate offer conflicts per college placement guidelines and updating campus analytics.' },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 bg-gradient-to-b from-indigo-50/60 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Next-Generation College Placement Management System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight max-w-5xl mx-auto leading-[1.15]">
            Connecting Students with <span className="text-indigo-600">Career Opportunities</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            A centralized placement management platform connecting students, recruiters, and placement officers with automated eligibility checks, real-time interview workflows, and live recruitment analytics.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/explore-jobs"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-200 transition-all hover:scale-105"
            >
              <Briefcase className="w-5 h-5" />
              <span>Explore Jobs</span>
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-200 shadow-sm transition-all"
            >
              <span>Login to Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base transition-all"
            >
              <span>Register Now</span>
            </Link>
          </div>

          {/* Demo Credentials Showcase */}
          <div className="mt-12 max-w-3xl mx-auto p-4 rounded-2xl bg-white border border-indigo-100 shadow-sm text-xs text-slate-600 flex flex-wrap items-center justify-around gap-3">
            <span className="font-bold text-indigo-900">Demo Accounts (Password: Password@123):</span>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 font-mono text-indigo-700 font-semibold">admin@campusconnect.com</span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 font-mono text-amber-700 font-semibold">recruiter@technova.com</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 font-mono text-emerald-700 font-semibold">student@campusconnect.com</span>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm text-center">
            <p className="text-3xl sm:text-4xl font-extrabold text-indigo-600">88.5%</p>
            <p className="text-sm font-semibold text-slate-600 mt-2">Placement Rate</p>
            <p className="text-xs text-slate-400 mt-1">Across 7 departments</p>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm text-center">
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600">₹22.0 LPA</p>
            <p className="text-sm font-semibold text-slate-600 mt-2">Highest Package</p>
            <p className="text-xs text-slate-400 mt-1">In AI & Cloud Engineering</p>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm text-center">
            <p className="text-3xl sm:text-4xl font-extrabold text-amber-600">₹11.8 LPA</p>
            <p className="text-sm font-semibold text-slate-600 mt-2">Average Package</p>
            <p className="text-xs text-slate-400 mt-1">Class of 2026 Batch</p>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm text-center">
            <p className="text-3xl sm:text-4xl font-extrabold text-purple-600">50+ Offers</p>
            <p className="text-sm font-semibold text-slate-600 mt-2">Top Tier Partners</p>
            <p className="text-xs text-slate-400 mt-1">Across Tech & Consulting</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Designed for Every Stakeholder</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
            Engineered for High-Velocity Campus Placements
          </h3>
          <p className="text-slate-600 mt-4 text-base">
            Eliminate chaotic spreadsheets and outdated email threads with dedicated role-based portals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Student Portal</h4>
            <p className="text-slate-600 text-sm mt-3 leading-relaxed">
              Complete dynamic student profiles, view eligibility criteria before applying, monitor application stages, and prepare for scheduled interviews.
            </p>
            <ul className="mt-6 space-y-2 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Dynamic profile completion gauge</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Real-time eligibility checking engine</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Multi-filter job search & 1-click apply</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
              <Building2 className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Recruiter Portal</h4>
            <p className="text-slate-600 text-sm mt-3 leading-relaxed">
              Manage corporate company profiles, create detailed job postings with custom CGPA and branch requirements, review applicants, and schedule interviews.
            </p>
            <ul className="mt-6 space-y-2 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Verified company profile approval</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Applicant tracking and status updates</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Integrated interview scheduling tool</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Placement Officer Cell</h4>
            <p className="text-slate-600 text-sm mt-3 leading-relaxed">
              Full control center: approve/reject companies and job drives, supervise student directory, manage offers, and inspect comprehensive visual charts.
            </p>
            <ul className="mt-6 space-y-2 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Department & CTC visual analytics</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> One-click company & job approvals</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Complete drive governance & audits</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Step-by-Step Workflow</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
            How CampusConnect Powers Campus Placements
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((s, idx) => (
            <div key={idx} className="relative p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
              <span className="text-4xl font-black text-indigo-100">{s.num}</span>
              <h4 className="text-lg font-bold text-slate-900 mt-2">{s.title}</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Companies */}
      <section id="companies" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Top Employers</h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Hiring Partners on CampusConnect
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {partnerCompanies.map((c, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200/80 text-center hover:border-indigo-200 hover:shadow-md transition">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-indigo-600 mb-3">
                {c.name[0]}
              </div>
              <h4 className="font-bold text-slate-800 text-sm">{c.name}</h4>
              <p className="text-xs text-slate-500 mt-1">{c.industry}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{c.location}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Frequently Asked Questions</h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Everything You Need to Know
          </h3>
        </div>

        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <h4 className="font-bold text-slate-900 text-base flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span>{f.q}</span>
              </h4>
              <p className="mt-2 text-sm text-slate-600 pl-8 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
