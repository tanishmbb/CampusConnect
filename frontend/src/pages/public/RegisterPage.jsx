import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Building2, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    role: 'STUDENT',
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        role: formData.role,
        username: formData.username.trim(),
        email: formData.email.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      };
      await register(payload);
      toast.success('Registration successful! Welcome to CampusConnect.');
      if (formData.role === 'STUDENT') {
        navigate('/student/dashboard');
      } else {
        navigate('/recruiter/dashboard');
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (!err.response) {
        setError('Cannot connect to backend server! Please start Django backend: run "python manage.py runserver 127.0.0.1:8000" in the backend folder.');
      } else {
        const errors = err.response?.data;
        if (typeof errors === 'object' && errors !== null) {
          const firstKey = Object.keys(errors)[0];
          const val = Array.isArray(errors[firstKey]) ? errors[firstKey][0] : errors[firstKey];
          setError(`${firstKey.toUpperCase()}: ${val}`);
        } else {
          setError(err.response?.data?.detail || 'Failed to create account. Please verify input data.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-200">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-4">Create Account</h2>
          <p className="text-xs text-slate-500 mt-1">Join CampusConnect Placement Network</p>
        </div>

        {/* Role toggle */}
        <div className="mt-6 grid grid-cols-2 gap-3 p-1 rounded-2xl bg-slate-100">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'STUDENT' })}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              formData.role === 'STUDENT'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Candidate</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'RECRUITER' })}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              formData.role === 'RECRUITER'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Corporate Recruiter</span>
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs font-semibold text-rose-700 leading-relaxed">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">First Name</label>
              <input
                type="text"
                required
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="John"
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Last Name</label>
              <input
                type="text"
                required
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Username</label>
              <input
                type="text"
                required
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="johndoe"
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Email Address</label>
            <input
              type="email"
              required
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@campus.edu"
              className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Password</label>
              <input
                type="password"
                required
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-800">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}
