import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LogIn,
  UserPlus,
  LogOut,
  Calendar,
  Ticket,
  LayoutGrid,
  User,
  PlusCircle,
  Users,
  Building2,
  FileText
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { EventSphereLogo } from '../common/EventSphereLogo';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    showToast('You have been logged out successfully.', 'info');
    navigate('/login', { replace: true });
  };

  const navLinkStyle = ({ isActive }) => ({
    fontSize: '0.9rem',
    fontWeight: 600,
    color: isActive ? 'var(--primary-purple)' : 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    textDecoration: 'none',
    transition: 'color 0.15s ease'
  });

  return (
    <header className="public-header" style={{ borderBottom: '1px solid var(--border-subtle)', background: '#FFFFFF' }}>
      <div className="app-container public-header-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
        {/* Brand Logo */}
        <EventSphereLogo size="md" variant="dark" to={user ? (user.role === 'organizer' ? '/organizer/events' : user.role === 'admin' ? '/admin/dashboard' : '/') : '/'} />

        {/* Role-Appropriate Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          {/* USER / ATTENDEE */}
          {user && user.role === 'attendee' && (
            <>
              <NavLink to="/" style={navLinkStyle}>
                Home
              </NavLink>
              <NavLink to="/events" style={navLinkStyle}>
                Events
              </NavLink>
              <NavLink to="/attendee/bookings" style={navLinkStyle}>
                My Registrations
              </NavLink>
              <NavLink to="/attendee/dashboard" style={navLinkStyle}>
                My Dashboard
              </NavLink>
              <NavLink to="/attendee/profile" style={navLinkStyle}>
                Profile
              </NavLink>
            </>
          )}

          {/* ORGANIZER */}
          {user && user.role === 'organizer' && (
            <>
              <NavLink to="/organizer/events" style={navLinkStyle}>
                Home
              </NavLink>
              <NavLink to="/organizer/events" style={navLinkStyle}>
                My Events
              </NavLink>
              <NavLink to="/organizer/events/new" style={navLinkStyle}>
                <PlusCircle size={15} />
                <span>Create Event</span>
              </NavLink>
              <NavLink to="/organizer/events" style={navLinkStyle}>
                Registrations
              </NavLink>
              <NavLink to="/organizer/dashboard" style={navLinkStyle}>
                Dashboard
              </NavLink>
            </>
          )}

          {/* ADMIN */}
          {user && user.role === 'admin' && (
            <>
              <NavLink to="/admin/dashboard" style={navLinkStyle}>
                Home
              </NavLink>
              <NavLink to="/admin/users" style={navLinkStyle}>
                Users
              </NavLink>
              <NavLink to="/admin/users?role=organizer" style={navLinkStyle}>
                Organizers
              </NavLink>
              <NavLink to="/admin/events" style={navLinkStyle}>
                Events
              </NavLink>
              <NavLink to="/admin/events" style={navLinkStyle}>
                Registrations
              </NavLink>
              <NavLink to="/admin/dashboard" style={navLinkStyle}>
                Reports
              </NavLink>
            </>
          )}

          {/* GUEST / PUBLIC */}
          {!user && (
            <>
              <NavLink to="/" style={navLinkStyle}>
                Home
              </NavLink>
              <NavLink to="/events" style={navLinkStyle}>
                Events
              </NavLink>
              <NavLink to="/categories" style={navLinkStyle}>
                Categories
              </NavLink>
            </>
          )}
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={user.name}
                  style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--border-subtle)' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                    {user.name.split(' ')[0]}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--primary-purple)', textTransform: 'capitalize', fontWeight: 600 }}>
                    {user.role}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 10,
                  padding: '6px 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  color: '#DC2626',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#FEF2F2')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.86rem' }}>
                <LogIn size={15} />
                <span>Log In</span>
              </Link>
              <Link to="/register" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.86rem' }}>
                <UserPlus size={15} />
                <span>Sign Up</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
