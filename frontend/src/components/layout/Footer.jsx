import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { EventSphereLogo } from '../common/EventSphereLogo';

export const Footer = () => {
  const { user } = useAuth();

  return (
    <footer style={{ background: '#FFFFFF', borderTop: '1px solid var(--border-subtle)', padding: '56px 0 28px 0', marginTop: 'auto' }}>
      <div className="app-container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 36, marginBottom: 40 }}>
          {/* Brand Info */}
          <div>
            <div style={{ marginBottom: 14 }}>
              <EventSphereLogo size="md" variant="dark" to="/" />
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, maxWidth: 280 }}>
              The modern discovery and management platform for live conferences, concerts, exhibitions, and workshops.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 16 }}>
              Explore
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <Link to="/events">Browse All Events</Link>
              <Link to="/categories">Event Categories</Link>
              <Link to="/events?priceType=free">Free Events</Link>
              <Link to="/events?dateFilter=upcoming">Upcoming Gigs</Link>
            </div>
          </div>

          {/* Organizers */}
          <div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 16 }}>
              For Organizers
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              {user?.role === 'organizer' || user?.role === 'admin' ? (
                <>
                  <Link to="/organizer/events/new">Publish an Event</Link>
                  <Link to="/organizer/dashboard">Organizer Dashboard</Link>
                  <Link to="/organizer/analytics">Performance Analytics</Link>
                  <Link to="/organizer/events">Manage Attendee Lists</Link>
                </>
              ) : (
                <>
                  <Link to="/login">Host & Organize Events</Link>
                  <Link to="/events">Explore Local Events</Link>
                  <Link to="/categories">Browse Categories</Link>
                </>
              )}
            </div>
          </div>

          {/* Portals & Accounts */}
          <div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 16 }}>
              Account & Portals
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <Link to="/login">Sign In / Switch Roles</Link>
              <Link to="/register">Create Account</Link>
              {user?.role === 'admin' && (
                <Link to="/admin/dashboard">Administration Control</Link>
              )}
              <Link to="/settings">Account Settings</Link>
            </div>
          </div>
        </div>

        <div
          style={{
            paddingTop: 24,
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            fontSize: '0.82rem',
            color: 'var(--text-secondary)'
          }}
        >
          <span>© {new Date().getFullYear()} EventSphere Demo Platform. Fictional sample records for showcase.</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            Crafted with <Heart size={14} color="#EF4444" fill="#EF4444" /> for seamless event discovery.
          </span>
        </div>
      </div>
    </footer>
  );
};
