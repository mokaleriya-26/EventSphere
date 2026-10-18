import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  Bell,
  Search,
  PlusCircle,
  User,
  LogOut,
  Settings,
  CheckCircle2,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { useToast } from '../../context/ToastContext';

export const Topbar = ({ onToggleSidebar, title = 'Dashboard' }) => {
  const { user, logout, isOrganizer } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState(() =>
    notificationService.getNotifications(user?.id)
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead(user?.id);
    setNotifications(notificationService.getNotifications(user?.id));
  };

  const handleLogout = async () => {
    await logout();
    showToast('You have been logged out successfully.', 'info');
    navigate('/login', { replace: true });
  };

  const handleBackNavigation = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      if (user?.role === 'organizer') {
        navigate('/organizer/events');
      } else if (user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <header className="dashboard-topbar">
      {/* Left: Mobile hamburger + Back Arrow + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onToggleSidebar}
          className="btn-ghost"
          style={{ display: 'none', padding: 8 }}
          id="mobile-sidebar-toggle"
          aria-label="Toggle Navigation"
        >
          <Menu size={20} />
        </button>

        <button
          type="button"
          onClick={handleBackNavigation}
          className="btn-secondary"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            padding: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#FFFFFF',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-main)',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer'
          }}
          title="Back to previous page"
          aria-label="Back to previous page"
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </button>

        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
            {title}
          </h1>
        </div>
      </div>

      {/* Right Controls: Notification & Profile Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              setProfileOpen(false);
            }}
            className="btn-secondary"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              padding: 0,
              position: 'relative'
            }}
            aria-label="Notifications"
          >
            <Bell size={18} color="var(--text-main)" />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  background: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  width: 17,
                  height: 17,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #FFFFFF'
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 48,
                background: '#FFFFFF',
                borderRadius: 16,
                boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                border: '1px solid var(--border-subtle)',
                width: 320,
                zIndex: 50,
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border-subtle)',
                  background: '#F9FAFB'
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{ fontSize: '0.75rem', color: 'var(--primary-purple)', fontWeight: 600 }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #F3F4F6',
                        background: n.read ? '#FFFFFF' : 'var(--accent-lavender)',
                        transition: 'background 0.2s'
                      }}
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 2 }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>{n.time}</div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ padding: '8px', textAlign: 'center', borderTop: '1px solid #F3F4F6' }}>
                <Link
                  to="/notifications"
                  onClick={() => setNotifOpen(false)}
                  style={{ fontSize: '0.8rem', color: 'var(--primary-purple)', fontWeight: 600 }}
                >
                  View All Notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotifOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              padding: '4px 10px 4px 4px',
              borderRadius: 9999
            }}
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
              alt={user?.name || 'User'}
              style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }}
            />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name?.split(' ')[0] || 'Account'}
            </span>
          </button>

          {profileOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 48,
                background: '#FFFFFF',
                borderRadius: 14,
                boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                border: '1px solid var(--border-subtle)',
                width: 210,
                zIndex: 50,
                padding: '6px 0'
              }}
            >
              <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>{user?.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{user?.role?.toUpperCase()}</div>
              </div>

              <Link
                to={user?.role === 'attendee' ? '/attendee/profile' : '/settings'}
                onClick={() => setProfileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 16px',
                  fontSize: '0.85rem',
                  color: 'var(--text-main)'
                }}
              >
                <User size={15} /> My Profile
              </Link>

              <Link
                to="/settings"
                onClick={() => setProfileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 16px',
                  fontSize: '0.85rem',
                  color: 'var(--text-main)'
                }}
              >
                <Settings size={15} /> Preferences
              </Link>

              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 16px',
                  fontSize: '0.85rem',
                  color: '#DC2626',
                  width: '100%',
                  textAlign: 'left'
                }}
              >
                <LogOut size={15} /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
