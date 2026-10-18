import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../services/apiClient';
import {
  Users,
  Calendar,
  CheckCircle2,
  Layers,
  Shield,
  TrendingUp,
  Clock,
  Ticket,
  Building2,
  CalendarDays,
  History,
  AlertCircle,
  Loader2
} from 'lucide-react';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get('/admin/dashboard');
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load administrator dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <Loader2 className="animate-spin" size={32} color="var(--primary-purple)" />
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading live MySQL platform statistics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 16, color: '#991B1B' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, marginBottom: 6 }}>
          <AlertCircle size={20} />
          <span>Error loading dashboard metrics</span>
        </div>
        <p style={{ margin: '0 0 14px 0', fontSize: '0.9rem' }}>{error}</p>
        <button onClick={fetchDashboardData} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
          Retry
        </button>
      </div>
    );
  }

  const { users = {}, events = {}, registrations = {}, recentEvents = [], recentRegistrations = [] } = data || {};

  return (
    <div>
      {/* Page Title */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
          Platform Administration
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: 4 }}>
          Live metrics backed by local MySQL database (<code style={{ background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: 6 }}>eventspear_local</code>).
        </p>
      </div>

      {/* 4 Main Summary Cards */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {/* Total Users */}
        <div className="card-surface" style={{ padding: '22px 24px', borderRadius: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Total Users
            </span>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--accent-lavender)', color: 'var(--dark-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={19} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
            {users.totalUsers || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span><strong>{users.attendees || 0}</strong> Attendees</span>
            <span>•</span>
            <span><strong>{users.organizers || 0}</strong> Organizations</span>
            <span>•</span>
            <span><strong>{users.admins || 0}</strong> Admin</span>
          </div>
        </div>

        {/* Total Events */}
        <div className="card-surface" style={{ padding: '22px 24px', borderRadius: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Total Events
            </span>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--accent-blue)', color: 'var(--accent-blue-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={19} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
            {events.totalEvents || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 8 }}>
            <span><strong>{events.published || 0}</strong> Published</span>
            <span> • </span>
            <span><strong>{events.draft || 0}</strong> Drafts</span>
          </div>
        </div>

        {/* Event Schedule Distribution */}
        <div className="card-surface" style={{ padding: '22px 24px', borderRadius: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Date Distribution
            </span>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--accent-amber)', color: 'var(--accent-amber-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={19} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10B981' }}>{events.upcomingCount || 0}</span>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>future</span>
            <span style={{ color: 'var(--border-subtle)' }}>|</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F59E0B' }}>{events.todayCount || 0}</span>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>today</span>
            <span style={{ color: 'var(--border-subtle)' }}>|</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#6B7280' }}>{events.pastCount || 0}</span>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>past</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 8 }}>
            {events.pastCount || 0} Past, {events.todayCount || 0} Today, {events.upcomingCount || 0} Future
          </div>
        </div>

        {/* Registrations */}
        <div className="card-surface" style={{ padding: '22px 24px', borderRadius: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Total Registrations
            </span>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--accent-mint)', color: 'var(--accent-mint-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ticket size={19} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
            {registrations.totalRegistrations || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 600, marginTop: 8 }}>
            {registrations.confirmedBookings || 0} active confirmed bookings
          </div>
        </div>
      </div>

      {/* Quick Navigation Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <Link
          to="/admin/events"
          className="card-surface"
          style={{ padding: '20px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}
        >
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-lavender)', color: 'var(--dark-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CalendarDays size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Manage Events</h4>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{events.totalEvents || 0} platform events</span>
          </div>
        </Link>

        <Link
          to="/admin/users"
          className="card-surface"
          style={{ padding: '20px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}
        >
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-blue)', color: 'var(--accent-blue-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Users size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>User Accounts</h4>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{users.attendees || 0} attendees</span>
          </div>
        </Link>

        <Link
          to="/admin/users?role=organizer"
          className="card-surface"
          style={{ padding: '20px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}
        >
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-amber)', color: 'var(--accent-amber-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Building2 size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Organizations</h4>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{users.organizers || 0} host organizations</span>
          </div>
        </Link>

        <Link
          to="/admin/categories"
          className="card-surface"
          style={{ padding: '20px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}
        >
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-mint)', color: 'var(--accent-mint-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Layers size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Categories</h4>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>Taxonomies</span>
          </div>
        </Link>
      </div>

      {/* Two Columns: Recent Events & Recent Registrations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: 24 }}>
        {/* Recent Events Table */}
        <div className="card-surface" style={{ borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Recent Events
            </h3>
            <Link to="/admin/events" style={{ fontSize: '0.82rem', color: 'var(--primary-purple)', fontWeight: 600 }}>
              View All ({events.totalEvents || 0})
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '10px 18px', fontWeight: 600 }}>Title</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>Organizer</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '10px 18px', fontWeight: 600, textAlign: 'right' }}>Registrations</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No events registered yet.
                    </td>
                  </tr>
                ) : (
                  recentEvents.map(e => (
                    <tr key={e.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-main)' }}>
                        <Link to={`/events/${e.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {e.title}
                        </Link>
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                        {e.organizerName || 'Organizer'}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className={`badge-pill ${e.status === 'published' ? 'badge-mint' : e.status === 'draft' ? 'badge-amber' : 'badge-red'}`} style={{ fontSize: '0.72rem' }}>
                          {e.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 18px', textAlign: 'right', fontWeight: 700 }}>
                        {e.registeredCount || 0} / {e.capacity || 100}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Registrations Table */}
        <div className="card-surface" style={{ borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Recent Registrations
            </h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {registrations.totalRegistrations || 0} total
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '10px 18px', fontWeight: 600 }}>Attendee</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>Event</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '10px 18px', fontWeight: 600, textAlign: 'right' }}>Ref</th>
                </tr>
              </thead>
              <tbody>
                {recentRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No registrations found.
                    </td>
                  </tr>
                ) : (
                  recentRegistrations.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-main)' }}>
                        <div>{r.attendeeName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 400 }}>{r.attendeeEmail}</div>
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.eventTitle}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className={`badge-pill ${r.status === 'confirmed' ? 'badge-mint' : 'badge-red'}`} style={{ fontSize: '0.72rem' }}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 18px', textAlign: 'right', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                        {r.bookingRef}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
