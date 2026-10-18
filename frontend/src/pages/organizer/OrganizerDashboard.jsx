import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { eventService } from '../../services/eventService';
import { bookingService } from '../../services/bookingService';
import {
  CalendarDays,
  Users,
  CheckCircle2,
  FileEdit,
  PlusCircle,
  TrendingUp,
  ArrowRight,
  MapPin,
  Clock,
  Sparkles,
  Ticket
} from 'lucide-react';

import { apiClient } from '../../services/apiClient';

export const OrganizerDashboard = () => {
  const { user } = useAuth();
  const organizerId = user?.id || 'usr-organizer';

  const [myEvents, setMyEvents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    apiClient.get('/organizer/events')
      .then(res => {
        if (isMounted && res?.events) {
          setMyEvents(res.events);
        }
      })
      .catch(() => {
        if (isMounted) {
          setMyEvents(eventService.getOrganizerEventsSync(organizerId));
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [organizerId]);

  // Dynamically calculate metrics
  const stats = useMemo(() => {
    const totalEvents = myEvents.length;
    const publishedEvents = myEvents.filter(e => e.status === 'published').length;
    const draftEvents = myEvents.filter(e => e.status === 'draft').length;
    const totalRegistrations = myEvents.reduce((acc, e) => acc + (e.registeredCount || 0), 0);
    const totalCapacity = myEvents.reduce((acc, e) => acc + (e.capacity || 0), 0);
    const occupancyRate = totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0;

    return { totalEvents, publishedEvents, draftEvents, totalRegistrations, totalCapacity, occupancyRate };
  }, [myEvents]);

  // Upcoming published events
  const upcomingEvents = myEvents
    .filter(e => e.status === 'published')
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 3);

  // Recent events
  const recentEvents = [...myEvents]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div>
      {/* Top Welcome Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 32
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: 4 }}>
            Welcome back, {user?.organization || user?.name || 'Organizer'}! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Here is your live summary of attendee registrations, capacity and event schedules.
          </p>
        </div>

        <Link to="/organizer/events/new" className="btn-primary" style={{ padding: '10px 20px' }}>
          <PlusCircle size={18} />
          <span>Create New Event</span>
        </Link>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        {/* Total Events */}
        <div className="card-surface" style={{ padding: '22px 24px', borderRadius: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Total Events
            </span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-lavender)', color: 'var(--dark-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarDays size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>
            {stats.totalEvents}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Across all categories
          </div>
        </div>

        {/* Published Events */}
        <div className="card-surface" style={{ padding: '22px 24px', borderRadius: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Live Published
            </span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-mint)', color: 'var(--accent-mint-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>
            {stats.publishedEvents}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#0E744F', fontWeight: 600 }}>
            Accepting registrations
          </div>
        </div>

        {/* Total Registrations */}
        <div className="card-surface" style={{ padding: '22px 24px', borderRadius: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Total Attendees
            </span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-blue)', color: 'var(--accent-blue-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>
            {stats.totalRegistrations}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            {stats.occupancyRate}% overall fill rate
          </div>
        </div>

        {/* Draft Events */}
        <div className="card-surface" style={{ padding: '22px 24px', borderRadius: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Pending Drafts
            </span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-amber)', color: 'var(--accent-amber-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileEdit size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>
            {stats.draftEvents}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#B45309', fontWeight: 600 }}>
            Unpublished entries
          </div>
        </div>
      </div>

      {/* Grid: Registration Trends Visual + Upcoming Schedule */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 5fr) minmax(320px, 4fr)', gap: 28, marginBottom: 32 }}>
        {/* Registration Performance Bars */}
        <div className="card-surface" style={{ padding: '28px', borderRadius: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Attendee Capacity by Event
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                Fill rates and demand across your active published events
              </p>
            </div>
            <Link to="/organizer/analytics" style={{ fontSize: '0.85rem', color: 'var(--primary-purple)', fontWeight: 600 }}>
              Full Analytics
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {myEvents.slice(0, 4).map(evt => {
              const pct = Math.round(((evt.registeredCount || 0) / (evt.capacity || 1)) * 100);
              return (
                <div key={evt.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '65%' }}>
                      {evt.title}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      <strong>{evt.registeredCount}</strong> / {evt.capacity} ({pct}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 8, background: '#F1F5F9', borderRadius: 9999, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, pct)}%`,
                        height: '100%',
                        background: pct >= 90 ? '#10B981' : pct >= 50 ? 'var(--primary-purple)' : '#9565E8',
                        borderRadius: 9999
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events Mini Cards */}
        <div className="card-surface" style={{ padding: '28px', borderRadius: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Next Up on Calendar
            </h3>
            <Link to="/organizer/events" style={{ fontSize: '0.85rem', color: 'var(--primary-purple)', fontWeight: 600 }}>
              All Events
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {upcomingEvents.map(evt => (
              <div
                key={evt.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 14px',
                  borderRadius: 14,
                  background: 'var(--bg-page)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: 'var(--accent-lavender)',
                    color: 'var(--dark-purple)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    {new Date(evt.startDate).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1 }}>
                    {new Date(evt.startDate).getDate()}
                  </span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {evt.title}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    {evt.city} • {evt.registeredCount} attendees
                  </div>
                </div>

                <Link
                  to={`/organizer/events/${evt.id}/attendees`}
                  className="btn-ghost"
                  style={{ padding: '6px', borderRadius: '50%' }}
                  title="View attendee roster"
                >
                  <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Events Table */}
      <div className="card-surface" style={{ borderRadius: 22, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Recent Event Activity
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              Quick management of your latest creations
            </p>
          </div>
          <Link to="/organizer/events" className="btn-secondary" style={{ padding: '7px 16px', fontSize: '0.84rem' }}>
            View All ({myEvents.length})
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '14px 24px', fontWeight: 600 }}>Title</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Registered</th>
                <th style={{ padding: '14px 24px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.map(evt => (
                <tr key={evt.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '14px 24px', fontWeight: 600, color: 'var(--text-main)' }}>
                    {evt.title}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                    {evt.categoryName}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                    {evt.startDate}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={`badge-pill ${evt.status === 'published' ? 'badge-mint' : evt.status === 'draft' ? 'badge-amber' : 'badge-red'}`}>
                      {evt.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--primary-purple)' }}>
                    {evt.registeredCount} / {evt.capacity}
                  </td>
                  <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 8 }}>
                      <Link to={`/organizer/events/${evt.id}/edit`} className="btn-secondary" style={{ padding: '5px 12px', fontSize: '0.78rem' }}>
                        Edit
                      </Link>
                      <Link to={`/organizer/events/${evt.id}/attendees`} className="btn-primary" style={{ padding: '5px 12px', fontSize: '0.78rem' }}>
                        Roster
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
