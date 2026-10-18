import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/bookingService';
import { eventService } from '../../services/eventService';
import { EventCard } from '../../components/events/EventCard';
import {
  Ticket,
  Compass,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Clock,
  MapPin,
  Sparkles
} from 'lucide-react';

export const AttendeeDashboard = () => {
  const { user } = useAuth();
  const userId = user?.id || 'usr-attendee';

  const [bookings, setBookings] = React.useState(() => bookingService.getUserBookings(userId));
  const [publicEvents, setPublicEvents] = React.useState(() => eventService.getPublicEvents());

  React.useEffect(() => {
    bookingService.syncMyBookings().then(() => {
      setBookings(bookingService.getUserBookings(userId));
    });
    eventService.syncFromBackend().then(() => {
      setPublicEvents(eventService.getPublicEvents());
    });
  }, [userId]);

  const activeBookings = bookings.filter(b => b.status === 'confirmed');
  const pastBookings = bookings.filter(b => b.status === 'past');

  // Recommendations: 3 published events user hasn't booked yet
  const bookedEventIds = new Set(bookings.map(b => b.eventId));
  const recommendedEvents = publicEvents
    .filter(e => !bookedEventIds.has(e.id))
    .slice(0, 3);

  return (
    <div>
      {/* Header Greeting */}
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
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
            Hello, {user?.name || 'Attendee'}! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: 4 }}>
            Explore your upcoming tickets and discover exciting live experiences happening nearby.
          </p>
        </div>

        <Link to="/events" className="btn-primary" style={{ padding: '10px 20px' }}>
          <Compass size={18} />
          <span>Explore All Events</span>
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid-3" style={{ marginBottom: 32 }}>
        <div className="card-surface" style={{ padding: '22px 24px', borderRadius: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>UPCOMING TICKETS</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-lavender)', color: 'var(--dark-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ticket size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {activeBookings.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 600, marginTop: 4 }}>
            Confirmed registrations
          </div>
        </div>

        <div className="card-surface" style={{ padding: '22px 24px', borderRadius: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>EVENTS ATTENDED</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-mint)', color: 'var(--accent-mint-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {pastBookings.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Completed past sessions
          </div>
        </div>

        <div className="card-surface" style={{ padding: '22px 24px', borderRadius: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>CITY PREFERENCE</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-blue)', color: 'var(--accent-blue-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 4 }}>
            {user?.city || 'San Francisco, CA'}
          </div>
          <Link to="/attendee/profile" style={{ fontSize: '0.78rem', color: 'var(--primary-purple)', fontWeight: 600, marginTop: 4, display: 'inline-block' }}>
            Update Profile
          </Link>
        </div>
      </div>

      {/* Upcoming Bookings Section */}
      <div className="card-surface" style={{ padding: '28px', borderRadius: 22, marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            My Upcoming Bookings
          </h3>
          <Link to="/attendee/bookings" style={{ fontSize: '0.86rem', color: 'var(--primary-purple)', fontWeight: 600 }}>
            View All ({bookings.length})
          </Link>
        </div>

        {activeBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)' }}>
            <p style={{ marginBottom: 16 }}>You don't have any upcoming bookings yet.</p>
            <Link to="/events" className="btn-primary">
              Discover Events
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {activeBookings.map(b => (
              <div
                key={b.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderRadius: 16,
                  background: 'var(--bg-page)',
                  border: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  gap: 14
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--dark-purple)', background: 'var(--accent-lavender)', padding: '2px 8px', borderRadius: 6 }}>
                      {b.bookingRef}
                    </span>
                    <span className="badge-pill badge-mint">Confirmed</span>
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: '4px 0' }}>
                    {b.eventTitle}
                  </h4>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {b.eventDate} • {b.eventTime} • {b.venue}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Link to={`/events/${b.eventId}`} className="btn-secondary" style={{ padding: '7px 16px', fontSize: '0.84rem' }}>
                    View Event
                  </Link>
                  <Link to="/attendee/bookings" className="btn-primary" style={{ padding: '7px 16px', fontSize: '0.84rem' }}>
                    Ticket Pass
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended For You Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Recommended For You
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Hand-picked events you might enjoy attending next
            </p>
          </div>
          <Link to="/events" className="btn-secondary" style={{ padding: '7px 16px', fontSize: '0.85rem' }}>
            Browse More
          </Link>
        </div>

        <div className="grid-3">
          {recommendedEvents.map(evt => (
            <EventCard key={evt.id} event={evt} />
          ))}
        </div>
      </div>
    </div>
  );
};
