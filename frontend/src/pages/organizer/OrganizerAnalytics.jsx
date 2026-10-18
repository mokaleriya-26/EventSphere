import React, { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { eventService } from '../../services/eventService';
import {
  TrendingUp,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  DollarSign
} from 'lucide-react';

export const OrganizerAnalytics = () => {
  const { user } = useAuth();
  const organizerId = user?.id || 'usr-organizer';

  const [myEvents, setMyEvents] = React.useState(() => eventService.getOrganizerEventsSync(organizerId));

  React.useEffect(() => {
    let isMounted = true;
    eventService.getOrganizerEvents(organizerId).then(data => {
      if (isMounted && Array.isArray(data)) {
        setMyEvents(data);
      }
    }).catch(() => {
      if (isMounted) {
        setMyEvents(eventService.getOrganizerEventsSync(organizerId));
      }
    });
    return () => { isMounted = false; };
  }, [organizerId]);

  const analytics = useMemo(() => {
    const list = Array.isArray(myEvents) ? myEvents : [];
    const totalEvents = list.length;
    const published = list.filter(e => e.status === 'published').length;
    const drafts = list.filter(e => e.status === 'draft').length;
    const totalRegistrations = list.reduce((acc, e) => acc + (e.registeredCount || 0), 0);
    const totalCapacity = list.reduce((acc, e) => acc + (e.capacity || 0), 0);
    const avgFillRate = totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0;

    // Category distribution
    const categoryCounts = {};
    list.forEach(e => {
      const cat = e.categoryName || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    return { totalEvents, published, drafts, totalRegistrations, totalCapacity, avgFillRate, categoryCounts };
  }, [myEvents]);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
          Performance Analytics
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: 2 }}>
          Detailed metrics, attendee demand, and distribution for your organizer portfolio.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        <div className="card-surface" style={{ padding: '22px 24px', borderRadius: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>TOTAL ATTENDEES</span>
            <Users size={18} color="var(--primary-purple)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {analytics.totalRegistrations}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 600, marginTop: 4 }}>
            Active registrations across portfolio
          </div>
        </div>

        <div className="card-surface" style={{ padding: '22px 24px', borderRadius: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>AVERAGE FILL RATE</span>
            <TrendingUp size={18} color="#10B981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {analytics.avgFillRate}%
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Out of {analytics.totalCapacity} total capacity
          </div>
        </div>

        <div className="card-surface" style={{ padding: '22px 24px', borderRadius: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>PUBLISHED EVENTS</span>
            <CheckCircle2 size={18} color="#3B82F6" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {analytics.published}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Live on EventSphere discovery
          </div>
        </div>

        <div className="card-surface" style={{ padding: '22px 24px', borderRadius: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>DRAFT IN PROGRESS</span>
            <Calendar size={18} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {analytics.drafts}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Unpublished working drafts
          </div>
        </div>
      </div>

      {/* Breakdown Section: Category Distribution & Performance Table */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)', gap: 28, marginBottom: 32 }}>
        {/* Category Breakdown */}
        <div className="card-surface" style={{ padding: '28px', borderRadius: 22 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 18 }}>
            Category Distribution
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Object.entries(analytics.categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / (analytics.totalEvents || 1)) * 100);
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 5 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cat}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: '#F1F5F9', borderRadius: 9999, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: 'var(--primary-purple)',
                        borderRadius: 9999
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Event Fill Rates */}
        <div className="card-surface" style={{ padding: '28px', borderRadius: 22 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 18 }}>
            Individual Event Performance
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {myEvents.map(evt => {
              const rate = Math.round(((evt.registeredCount || 0) / (evt.capacity || 1)) * 100);
              return (
                <div key={evt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {evt.title}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                      {evt.city} • {evt.categoryName} • Status: {evt.status}
                    </div>
                  </div>
                  <div style={{ width: 140, textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-purple)' }}>
                      {evt.registeredCount} / {evt.capacity} ({rate}%)
                    </div>
                    <div style={{ width: '100%', height: 5, background: '#E5E7EB', borderRadius: 9999, marginTop: 4 }}>
                      <div
                        style={{
                          width: `${Math.min(100, rate)}%`,
                          height: '100%',
                          background: rate >= 90 ? '#10B981' : 'var(--primary-purple)',
                          borderRadius: 9999
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
