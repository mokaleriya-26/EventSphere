import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiClient } from '../../services/apiClient';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  Users,
  Search,
  Shield,
  Building2,
  User,
  UserX,
  UserCheck,
  AlertCircle,
  Loader2,
  Building
} from 'lucide-react';

export const AdminUsers = () => {
  const { user: currentAdmin } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const roleParam = searchParams.get('role') || 'all';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(roleParam);
  const [suspendTarget, setSuspendTarget] = useState(null);

  // Sync roleFilter when URL param changes
  useEffect(() => {
    if (searchParams.get('role')) {
      setRoleFilter(searchParams.get('role'));
    }
  }, [searchParams]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get('/admin/users');
      if (res?.users && Array.isArray(res.users)) {
        setUsers(res.users);
      }
    } catch (err) {
      setError(err.message || 'Failed to load users from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Compute live counts directly from database query results
  const counts = useMemo(() => {
    const total = users.length;
    const attendees = users.filter(u => u.role === 'attendee').length;
    const organizers = users.filter(u => u.role === 'organizer').length;
    const admins = users.filter(u => u.role === 'admin').length;
    return { total, attendees, organizers, admins };
  }, [users]);

  const handleRoleChange = (newRole) => {
    setRoleFilter(newRole);
    if (newRole === 'all') {
      searchParams.delete('role');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ role: newRole });
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = search.trim().toLowerCase();
      const matchesSearch = !q ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.organization && u.organization.toLowerCase().includes(q));
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const handleToggleStatus = async (targetUser) => {
    if (targetUser.id === currentAdmin?.id) {
      showToast('Action prevented: You cannot suspend your own active administrator account.', 'error');
      return;
    }

    if (targetUser.status === 'active') {
      setSuspendTarget(targetUser);
    } else {
      try {
        const res = await apiClient.patch(`/admin/users/${targetUser.id}/status`);
        if (res?.user) {
          setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, status: res.user.status } : u));
          showToast(`Account for ${targetUser.name} reactivated.`, 'success');
        }
      } catch (err) {
        showToast(err.message || 'Failed to reactivate account.', 'error');
      }
    }
  };

  const confirmSuspend = async () => {
    if (!suspendTarget) return;
    try {
      const res = await apiClient.patch(`/admin/users/${suspendTarget.id}/status`);
      if (res?.user) {
        setUsers(prev => prev.map(u => u.id === suspendTarget.id ? { ...u, status: res.user.status } : u));
        showToast(`Account for ${suspendTarget.name} has been suspended.`, 'info');
      }
    } catch (err) {
      showToast(err.message || 'Failed to suspend account.', 'error');
    } finally {
      setSuspendTarget(null);
    }
  };

  return (
    <div>
      {/* Title & Live Database Counts */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
            User & Organization Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: 4 }}>
            Direct oversight of all platform attendees, event host organizations, and administrators from MySQL.
          </p>
        </div>

        {/* Live metric summary pill */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ background: '#EFF6FF', color: '#1E40AF', padding: '6px 12px', borderRadius: 10, fontSize: '0.82rem', fontWeight: 700 }}>
            {counts.attendees} Attendees
          </span>
          <span style={{ background: '#F5F3FF', color: '#6D28D9', padding: '6px 12px', borderRadius: 10, fontSize: '0.82rem', fontWeight: 700 }}>
            {counts.organizers} Organizations
          </span>
          <span style={{ background: '#FEF3C7', color: '#B45309', padding: '6px 12px', borderRadius: 10, fontSize: '0.82rem', fontWeight: 700 }}>
            {counts.admins} Administrator
          </span>
        </div>
      </div>

      {/* Role Navigation Tabs */}
      <div className="pill-tabs" style={{ marginBottom: 20 }}>
        <button
          onClick={() => handleRoleChange('all')}
          className={`pill-tab ${roleFilter === 'all' ? 'active' : ''}`}
        >
          All Accounts ({counts.total})
        </button>
        <button
          onClick={() => handleRoleChange('attendee')}
          className={`pill-tab ${roleFilter === 'attendee' ? 'active' : ''}`}
        >
          Attendees / Users ({counts.attendees})
        </button>
        <button
          onClick={() => handleRoleChange('organizer')}
          className={`pill-tab ${roleFilter === 'organizer' ? 'active' : ''}`}
        >
          Organizations / Hosts ({counts.organizers})
        </button>
        <button
          onClick={() => handleRoleChange('admin')}
          className={`pill-tab ${roleFilter === 'admin' ? 'active' : ''}`}
        >
          Administrators ({counts.admins})
        </button>
      </div>

      {/* Search Bar */}
      <div
        className="card-surface"
        style={{
          padding: '14px 18px',
          borderRadius: 16,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}
      >
        <Search size={18} color="var(--primary-purple)" />
        <input
          type="text"
          placeholder="Filter by name, email, or organization..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '0.92rem' }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', padding: '14px 18px', borderRadius: 14, color: '#991B1B', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Loader2 className="animate-spin" size={28} color="var(--primary-purple)" style={{ margin: '0 auto 10px auto' }} />
          <span>Loading accounts from MySQL...</span>
        </div>
      ) : (
        /* Users Table */
        <div className="card-surface" style={{ borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Account & Identity</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Role</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Organization / Entity</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Location</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No accounts found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => {
                    const isCurrentAdmin = u.id === currentAdmin?.id;

                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <img
                              src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                              alt={u.name}
                              style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                {u.name}
                                {isCurrentAdmin && (
                                  <span style={{ fontSize: '0.7rem', color: 'var(--dark-purple)', background: 'var(--accent-lavender)', padding: '1px 6px', borderRadius: 4 }}>
                                    Current Admin
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <span
                            className={`badge-pill ${
                              u.role === 'admin'
                                ? 'badge-lavender'
                                : u.role === 'organizer'
                                ? 'badge-blue'
                                : 'badge-gray'
                            }`}
                          >
                            {u.role === 'admin' && <Shield size={12} />}
                            {u.role === 'organizer' && <Building2 size={12} />}
                            {u.role === 'attendee' && <User size={12} />}
                            {u.role === 'organizer' ? 'ORGANIZER' : u.role.toUpperCase()}
                          </span>
                        </td>

                        <td style={{ padding: '14px 16px', color: 'var(--text-main)' }}>
                          {u.organization ? (
                            <span style={{ fontWeight: 600, color: 'var(--dark-purple)' }}>
                              {u.organization}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>

                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                          {u.city || 'Not specified'}
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <span className={`badge-pill ${u.status === 'active' ? 'badge-mint' : 'badge-red'}`}>
                            {u.status === 'active' ? 'Active' : 'Suspended'}
                          </span>
                        </td>

                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          {isCurrentAdmin ? (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Admin Root</span>
                          ) : u.status === 'active' ? (
                            <button
                              onClick={() => handleToggleStatus(u)}
                              className="btn-secondary"
                              style={{ padding: '5px 12px', fontSize: '0.78rem', color: '#DC2626' }}
                            >
                              <UserX size={13} /> Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleStatus(u)}
                              className="btn-secondary"
                              style={{ padding: '5px 12px', fontSize: '0.78rem', color: '#0E744F' }}
                            >
                              <UserCheck size={13} /> Reactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(suspendTarget)}
        onClose={() => setSuspendTarget(null)}
        onConfirm={confirmSuspend}
        title={`Suspend Account for ${suspendTarget?.name}?`}
        message="This user or organization will be prevented from signing in until reactivated."
        confirmText="Suspend Account"
        danger={true}
      />
    </div>
  );
};
