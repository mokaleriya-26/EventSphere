import React from 'react';
import { Navigate, useLocation, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 16
        }}
        aria-live="polite"
        aria-busy="true"
      >
        <Loader2
          size={36}
          className="animate-spin"
          color="var(--primary-violet)"
          aria-hidden="true"
        />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Verifying session...
        </p>
      </div>
    );
  }

  // Not authenticated -> redirect to login preserving intent
  if (!user) {
    const redirectUrl = `/login?redirect=${encodeURIComponent(
      location.pathname + location.search
    )}`;
    return <Navigate to={redirectUrl} replace />;
  }

  // Role authorization check
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          padding: '40px 24px'
        }}
      >
        <div
          style={{
            background: '#FEE2E2',
            color: '#B91C1C',
            width: 64,
            height: 64,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20
          }}
        >
          <ShieldAlert size={32} aria-hidden="true" />
        </div>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            marginBottom: 8
          }}
        >
          Access Forbidden (403)
        </h1>
        <p
          style={{
            color: 'var(--text-secondary)',
            maxWidth: 420,
            fontSize: '0.95rem',
            marginBottom: 24,
            lineHeight: 1.5
          }}
        >
          Your account role (<strong>{user.role}</strong>) does not have permission
          to access this area.
        </p>
        <Link
          to={
            user.role === 'admin'
              ? '/admin/dashboard'
              : user.role === 'organizer'
              ? '/organizer/events'
              : '/'
          }
          className="btn-primary"
          style={{ textDecoration: 'none' }}
        >
          Return to {user.role === 'attendee' ? 'Home' : 'My Dashboard'}
        </Link>
      </div>
    );
  }

  return children ? children : <Outlet />;
};
