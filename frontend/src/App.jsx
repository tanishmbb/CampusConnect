import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ExploreJobsPage from './pages/public/ExploreJobsPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import JobSearch from './pages/student/JobSearch';
import JobDetails from './pages/student/JobDetails';
import MyApplications from './pages/student/MyApplications';
import StudentInterviews from './pages/student/StudentInterviews';
import StudentNotifications from './pages/student/StudentNotifications';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import CompanyProfile from './pages/recruiter/CompanyProfile';
import PostJob from './pages/recruiter/PostJob';
import MyJobs from './pages/recruiter/MyJobs';
import JobApplicants from './pages/recruiter/JobApplicants';
import RecruiterInterviews from './pages/recruiter/RecruiterInterviews';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminCompanies from './pages/admin/AdminCompanies';
import AdminJobs from './pages/admin/AdminJobs';
import AdminApplications from './pages/admin/AdminApplications';
import AdminInterviews from './pages/admin/AdminInterviews';
import AdminAnalytics from './pages/admin/AdminAnalytics';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Layout */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/explore-jobs" element={<ExploreJobsPage />} />
            </Route>

            {/* Student Portal (Role: STUDENT) */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="jobs" element={<JobSearch />} />
              <Route path="jobs/:id" element={<JobDetails />} />
              <Route path="applications" element={<MyApplications />} />
              <Route path="interviews" element={<StudentInterviews />} />
              <Route path="notifications" element={<StudentNotifications />} />
            </Route>

            {/* Recruiter Portal (Role: RECRUITER) */}
            <Route
              path="/recruiter"
              element={
                <ProtectedRoute allowedRoles={['RECRUITER']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<RecruiterDashboard />} />
              <Route path="company" element={<CompanyProfile />} />
              <Route path="jobs" element={<MyJobs />} />
              <Route path="jobs/new" element={<PostJob />} />
              <Route path="jobs/:id/edit" element={<PostJob />} />
              <Route path="jobs/:id/applicants" element={<JobApplicants />} />
              <Route path="interviews" element={<RecruiterInterviews />} />
              <Route path="notifications" element={<StudentNotifications />} />
            </Route>

            {/* Admin Portal (Role: ADMIN) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="companies" element={<AdminCompanies />} />
              <Route path="jobs" element={<AdminJobs />} />
              <Route path="applications" element={<AdminApplications />} />
              <Route path="interviews" element={<AdminInterviews />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="notifications" element={<StudentNotifications />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
