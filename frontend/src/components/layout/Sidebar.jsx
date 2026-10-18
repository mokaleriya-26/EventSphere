import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutGrid,
  CalendarDays,
  PlusCircle,
  Layers,
  Users,
  Ticket,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
  Compass,
  ShieldCheck,
  Bell
} from 'lucide-react';

import { EventSphereLogo } from '../common/EventSphereLogo';
import { useToast } from '../../context/ToastContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin, isOrganizer, isAttendee } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    showToast('You have been logged out successfully.', 'info');
    navigate('/login', { replace: true });
  };

  return (
    <aside className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Logo */}
      <div className="sidebar-logo">
        <EventSphereLogo size="md" variant="light" to="/" />
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {/* Organizer Navigation */}
        {isOrganizer && (
          <>
            <NavLink
              to="/organizer/dashboard"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <LayoutGrid size={17} />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/organizer/events"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <CalendarDays size={17} />
              <span>Events</span>
            </NavLink>

            <NavLink
              to="/organizer/events/new"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <PlusCircle size={17} />
              <span>Create Event</span>
            </NavLink>

            <div className="sidebar-divider" />

            <NavLink
              to="/events"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Compass size={17} />
              <span>Explore</span>
            </NavLink>

            <NavLink
              to="/categories"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Layers size={17} />
              <span>Categories</span>
            </NavLink>

            <div className="sidebar-divider" />

            <NavLink
              to="/organizer/analytics"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <BarChart3 size={17} />
              <span>Analytics</span>
            </NavLink>

            <NavLink
              to="/settings"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Settings size={17} />
              <span>Settings</span>
            </NavLink>
          </>
        )}

        {/* Attendee Navigation */}
        {isAttendee && (
          <>
            <NavLink
              to="/attendee/dashboard"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <LayoutGrid size={17} />
              <span>Overview</span>
            </NavLink>

            <NavLink
              to="/attendee/bookings"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Ticket size={17} />
              <span>My Bookings</span>
            </NavLink>

            <NavLink
              to="/events"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Compass size={17} />
              <span>Explore Events</span>
            </NavLink>

            <div className="sidebar-divider" />

            <NavLink
              to="/categories"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Layers size={17} />
              <span>Categories</span>
            </NavLink>

            <NavLink
              to="/settings"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Settings size={17} />
              <span>Settings</span>
            </NavLink>
          </>
        )}

        {/* Admin Navigation */}
        {isAdmin && (
          <>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <LayoutGrid size={17} />
              <span>Overview</span>
            </NavLink>

            <NavLink
              to="/admin/events"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <CalendarDays size={17} />
              <span>Manage Events</span>
            </NavLink>

            <NavLink
              to="/admin/users"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Users size={17} />
              <span>User Accounts</span>
            </NavLink>

            <div className="sidebar-divider" />

            <NavLink
              to="/admin/categories"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Layers size={17} />
              <span>Categories</span>
            </NavLink>

            <NavLink
              to="/settings"
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Settings size={17} />
              <span>Settings</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* Sidebar Footer User Info */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px' }}>
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
            alt={user?.name || 'User'}
            style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.4)' }}
          />
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'Guest User'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              {user?.email || 'guest@eventsphere.demo'}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 12px',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.85rem',
            borderRadius: 9999,
            transition: 'background 0.2s',
            marginTop: 6
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};
