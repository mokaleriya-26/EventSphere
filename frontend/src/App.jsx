import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Loader2 } from 'lucide-react';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { EventsPage } from './pages/public/EventsPage';
import { EventDetailsPage } from './pages/public/EventDetailsPage';
import { EventRegisterPage } from './pages/public/EventRegisterPage';
import { CategoriesPage } from './pages/public/CategoriesPage';
import { CategoryDetailsPage } from './pages/public/CategoryDetailsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Attendee Pages
import { AttendeeDashboard } from './pages/attendee/AttendeeDashboard';
import { AttendeeBookings } from './pages/attendee/AttendeeBookings';
import { AttendeeProfile } from './pages/attendee/AttendeeProfile';

// Organizer Pages
import { OrganizerDashboard } from './pages/organizer/OrganizerDashboard';
import { OrganizerEvents } from './pages/organizer/OrganizerEvents';
import { OrganizerEventForm } from './pages/organizer/OrganizerEventForm';
import { OrganizerAttendees } from './pages/organizer/OrganizerAttendees';
import { OrganizerAnalytics } from './pages/organizer/OrganizerAnalytics';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminEvents } from './pages/admin/AdminEvents';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminCategories } from './pages/admin/AdminCategories';

// Utility Pages
import { NotificationsPage } from './pages/utility/NotificationsPage';
import { SettingsPage } from './pages/utility/SettingsPage';
import { NotFoundPage } from './pages/utility/NotFoundPage';

// Route Guards
import { ProtectedRoute } from './components/common/ProtectedRoute';

/**
 * Phase 2 & 3 Entry Flow:
 * When opening EventSpear (root /), show the Login Page first if not authenticated.
 * If authenticated, redirect each account to its specific home:
 * - Attendee -> public event discovery home page
 * - Organizer -> organizer home (/organizer/events)
 * - Admin -> administrator home (/admin/dashboard)
 */
function EntryFlow() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12
        }}
      >
        <Loader2 className="animate-spin" size={32} color="var(--primary-purple)" />
        <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Loading EventSpear...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'organizer') {
    return <Navigate to="/organizer/events" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Attendee gets regular event discovery experience
  return <HomePage />;
}

function DashboardRedirect() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12
        }}
      >
        <Loader2 className="animate-spin" size={32} color="var(--primary-purple)" />
        <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Opening your dashboard...</span>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login?redirect=/dashboard" replace />;
  }
  if (user.role === 'organizer') {
    return <Navigate to="/organizer/dashboard" replace />;
  }
  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/attendee/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Role-adaptive Dashboard Route */}
            <Route path="/dashboard" element={<DashboardRedirect />} />

            {/* Public Layout Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<EntryFlow />} />
              <Route path="/home" element={<EntryFlow />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:eventId" element={<EventDetailsPage />} />
              <Route
                path="/events/:eventId/register"
                element={
                  <ProtectedRoute allowedRoles={['attendee', 'organizer', 'admin']}>
                    <EventRegisterPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/categories/:slug" element={<CategoryDetailsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Dashboard Layout Routes */}
            {/* Organizer Section */}
            <Route
              path="/organizer"
              element={
                <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                  <DashboardLayout title="Events" />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/organizer/events" replace />} />
              <Route path="dashboard" element={<OrganizerDashboard />} />
              <Route path="events" element={<OrganizerEvents />} />
              <Route path="events/new" element={<OrganizerEventForm />} />
              <Route path="events/:eventId/edit" element={<OrganizerEventForm />} />
              <Route path="events/:eventId/attendees" element={<OrganizerAttendees />} />
              <Route path="analytics" element={<OrganizerAnalytics />} />
            </Route>

            {/* Attendee Section */}
            <Route
              path="/attendee"
              element={
                <ProtectedRoute allowedRoles={['attendee', 'admin']}>
                  <DashboardLayout title="My Activity" />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/attendee/dashboard" replace />} />
              <Route path="dashboard" element={<AttendeeDashboard />} />
              <Route path="bookings" element={<AttendeeBookings />} />
              <Route path="profile" element={<AttendeeProfile />} />
            </Route>

            {/* Admin Section */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout title="Administration" />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="categories" element={<AdminCategories />} />
            </Route>

            {/* Shared Utility inside Dashboard */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout title="EventSpear" />
                </ProtectedRoute>
              }
            >
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* 404 Route */}
            <Route element={<PublicLayout />}>
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
