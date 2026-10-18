import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles, RefreshCw, Shield, Building2, User } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';

export const DemoSwitcher = () => {
  const { user, switchRole, resetData } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleRoleChange = async (role) => {
    if (switching) return;
    setSwitching(true);
    try {
      const switched = await switchRole(role);
      showToast(`Switched active demo account to: ${role.toUpperCase()}`, 'info');
      if (role === 'organizer') navigate('/organizer/events');
      else if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'attendee') navigate('/attendee/dashboard');
    } catch {
      showToast(`Could not switch to ${role} demo user.`, 'error');
    } finally {
      setSwitching(false);
    }
  };

  const handleConfirmReset = () => {
    setShowResetConfirm(false);
    resetData();
    showToast('All demo data has been reset to defaults.', 'success');
    window.location.reload();
  };

  return (
    <div className="demo-bar" role="region" aria-label="Development Demo Controls">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontWeight: 700,
            letterSpacing: '0.02em',
            color: '#C7D2FE'
          }}
        >
          <Sparkles size={14} color="#A5B4FC" aria-hidden="true" /> DEMO MODE:
        </span>
        <span style={{ opacity: 0.85, fontSize: '0.78rem' }}>
          Active:{' '}
          <strong style={{ color: '#FFFFFF' }}>
            {user ? `${user.name} (${user.role.toUpperCase()})` : 'Public Guest'}
          </strong>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Switch Role:</span>

        <button
          type="button"
          onClick={() => handleRoleChange('organizer')}
          disabled={switching}
          aria-label="Switch active session to Organizer demo account"
          aria-current={user?.role === 'organizer' ? 'true' : undefined}
          style={{
            background:
              user?.role === 'organizer' ? '#7541C8' : 'rgba(255, 255, 255, 0.1)',
            color: '#FFFFFF',
            padding: '4px 10px',
            borderRadius: 9999,
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            cursor: switching ? 'not-allowed' : 'pointer'
          }}
        >
          <Building2 size={12} aria-hidden="true" /> Organizer
        </button>

        <button
          type="button"
          onClick={() => handleRoleChange('attendee')}
          disabled={switching}
          aria-label="Switch active session to Attendee demo account"
          aria-current={user?.role === 'attendee' ? 'true' : undefined}
          style={{
            background:
              user?.role === 'attendee' ? '#7541C8' : 'rgba(255, 255, 255, 0.1)',
            color: '#FFFFFF',
            padding: '4px 10px',
            borderRadius: 9999,
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            cursor: switching ? 'not-allowed' : 'pointer'
          }}
        >
          <User size={12} aria-hidden="true" /> Attendee
        </button>

        <button
          type="button"
          onClick={() => handleRoleChange('admin')}
          disabled={switching}
          aria-label="Switch active session to Admin demo account"
          aria-current={user?.role === 'admin' ? 'true' : undefined}
          style={{
            background:
              user?.role === 'admin' ? '#7541C8' : 'rgba(255, 255, 255, 0.1)',
            color: '#FFFFFF',
            padding: '4px 10px',
            borderRadius: 9999,
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            cursor: switching ? 'not-allowed' : 'pointer'
          }}
        >
          <Shield size={12} aria-hidden="true" /> Admin
        </button>

        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          title="Reset sample events, categories and registrations"
          aria-label="Reset all demo data back to factory defaults"
          style={{
            background: 'rgba(239, 68, 68, 0.2)',
            color: '#FCA5A5',
            padding: '4px 8px',
            borderRadius: 9999,
            fontSize: '0.72rem',
            fontWeight: 600,
            marginLeft: 8,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={11} aria-hidden="true" /> Reset Data
        </button>
      </div>

      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleConfirmReset}
        title="Reset Demo Data"
        message="This will reset all sample events, categories, and bookings back to defaults. Any unsaved changes will be lost. Are you sure you wish to proceed?"
        confirmText="Reset Everything"
        danger={true}
      />
    </div>
  );
};
