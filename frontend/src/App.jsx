import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import LandingPage from './pages/LandingPage';
import About from './pages/About';
import Support from './pages/Support';
import NotFound from './pages/NotFound';

// Auth
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Jobs (public + protected)
import JobListing from './pages/JobListing';
import JobDetails from './pages/JobDetails';

// Seeker
import JobSeekerDashboard from './pages/JobSeekerDashboard';

// Employer
import EmployerDashboard from './pages/EmployerDashboard';
import PostJob from './pages/PostJob';

// Admin
import AdminDashboard from './pages/AdminDashboard';
import AdminPendingVacancies from './pages/AdminPendingVacancies';
import AdminPayments from './pages/AdminPayments';

// Seeker / Moderator
import SeekerCards from './pages/SeekerCards';
import SeekerPayments from './pages/SeekerPayments';
import ModeratorJobQueue from './pages/ModeratorJobQueue';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/support" element={<Support />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Jobs are public to browse */}
        <Route path="/jobs" element={<JobListing />} />
        <Route path="/jobs/:id" element={<JobDetails />} />

        {/* Seeker only */}
        <Route path="/dashboard/seeker" element={
          <ProtectedRoute roles={['seeker']}><JobSeekerDashboard /></ProtectedRoute>
        } />

        {/* Employer only */}
        <Route path="/dashboard/employer" element={
          <ProtectedRoute roles={['vacancy']}><EmployerDashboard /></ProtectedRoute>
        } />
        <Route path="/post-job" element={
          <ProtectedRoute roles={['vacancy']}><PostJob /></ProtectedRoute>
        } />

        {/* Admin only */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
        } />

        {/* Seeker payment cards */}
        <Route path="/cards" element={
          <ProtectedRoute roles={['seeker']}><SeekerCards /></ProtectedRoute>
        } />

        {/* Seeker payments / escrow flow */}
        <Route path="/payments" element={
          <ProtectedRoute roles={['seeker']}><SeekerPayments /></ProtectedRoute>
        } />

        {/* Moderator */}
        <Route path="/moderator" element={
          <ProtectedRoute roles={['moderator']}><ModeratorJobQueue /></ProtectedRoute>
        } />

        {/* Admin extras */}
        <Route path="/admin/vacancies" element={
          <ProtectedRoute roles={['admin']}><AdminPendingVacancies /></ProtectedRoute>
        } />
        <Route path="/admin/payments" element={
          <ProtectedRoute roles={['admin']}><AdminPayments /></ProtectedRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
