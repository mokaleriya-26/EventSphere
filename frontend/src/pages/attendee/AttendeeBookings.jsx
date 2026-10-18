import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { bookingService } from '../../services/bookingService';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  XCircle,
  Eye,
  CheckCircle2,
  AlertTriangle,
  QrCode
} from 'lucide-react';

export const AttendeeBookings = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const userId = user?.id || 'usr-attendee';

  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'past', 'cancelled'
  const [bookings, setBookings] = useState(() => bookingService.getUserBookings(userId));
  const [cancelTargetId, setCancelTargetId] = useState(null);

  const refreshBookings = () => {
    setBookings(bookingService.getUserBookings(userId));
  };

  React.useEffect(() => {
    bookingService.syncMyBookings().then(() => {
      refreshBookings();
    });
  }, [userId]);

  const today = new Date().toISOString().split('T')[0];

  const counts = useMemo(() => {
    const upcoming = bookings.filter(b => b.status === 'confirmed' && b.eventDate >= today).length;
    const past = bookings.filter(b => b.status === 'past' || (b.status === 'confirmed' && b.eventDate < today)).length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    return { upcoming, past, cancelled };
  }, [bookings, today]);

  const displayedBookings = useMemo(() => {
    return bookings.filter(b => {
      if (activeTab === 'upcoming') {
        return b.status === 'confirmed' && b.eventDate >= today;
      }
      if (activeTab === 'past') {
        return b.status === 'past' || (b.status === 'confirmed' && b.eventDate < today);
      }
      if (activeTab === 'cancelled') {
        return b.status === 'cancelled';
      }
      return true;
    });
  }, [bookings, activeTab, today]);

  const handleConfirmCancel = async () => {
    if (!cancelTargetId) return;
    try {
      await bookingService.cancelBooking(cancelTargetId);
      refreshBookings();
      showToast('Booking cancelled successfully. Capacity updated.', 'info');
    } catch (err) {
      showToast(err.message || 'Could not cancel booking.', 'error');
    } finally {
      setCancelTargetId(null);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
          My Event Bookings
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: 4 }}>
          Access your digital admission passes, event schedules and booking references.
        </p>
      </div>

      {/* Tabs */}
      <div className="pill-tabs" style={{ marginBottom: 28 }}>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pill-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
        >
          Upcoming ({counts.upcoming})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`pill-tab ${activeTab === 'past' ? 'active' : ''}`}
        >
          Past Events ({counts.past})
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`pill-tab ${activeTab === 'cancelled' ? 'active' : ''}`}
        >
          Cancelled ({counts.cancelled})
        </button>
      </div>

      {/* Bookings List */}
      {displayedBookings.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title={`No ${activeTab} bookings found`}
          description={
            activeTab === 'upcoming'
              ? "You don't have any confirmed registrations for upcoming events. Check out our public discovery feed!"
              : `You have no ${activeTab} booking records.`
          }
          actionText={activeTab === 'upcoming' ? 'Discover Events' : undefined}
          onAction={() => window.location.assign('/events')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {displayedBookings.map(b => (
            <div
              key={b.id}
              className="card-surface"
              style={{
                borderRadius: 22,
                padding: '24px 28px',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 3fr) minmax(200px, 1.2fr)',
                gap: 24,
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      background: 'var(--accent-lavender)',
                      color: 'var(--dark-purple)',
                      padding: '3px 10px',
                      borderRadius: 8
                    }}
                  >
                    {b.bookingRef}
                  </span>
                  <span
                    className={`badge-pill ${
                      b.status === 'confirmed' ? 'badge-mint' : b.status === 'past' ? 'badge-gray' : 'badge-red'
                    }`}
                  >
                    {b.status === 'confirmed' ? 'Active Pass' : b.status}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    • {b.ticketType}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>
                  {b.eventTitle}
                </h3>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={15} color="var(--primary-purple)" /> {b.eventDate}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={15} color="var(--primary-purple)" /> {b.eventTime}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={15} color="var(--primary-purple)" /> {b.venue}
                  </span>
                </div>
              </div>

              {/* Right Pass Details & Actions */}
              <div
                style={{
                  background: 'var(--bg-page)',
                  padding: '16px 20px',
                  borderRadius: 16,
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  textAlign: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--dark-purple)', fontWeight: 700, fontSize: '0.85rem' }}>
                  <QrCode size={18} /> Digital Pass Ready
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <Link
                    to={`/events/${b.eventId}`}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '7px 12px', fontSize: '0.8rem' }}
                  >
                    <Eye size={14} /> Details
                  </Link>

                  {b.status === 'confirmed' && (
                    <button
                      onClick={() => setCancelTargetId(b.id)}
                      className="btn-ghost"
                      style={{ color: '#DC2626', padding: '7px 12px', fontSize: '0.8rem' }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(cancelTargetId)}
        onClose={() => setCancelTargetId(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel This Booking?"
        message="Are you sure you want to cancel your registration? Your reserved spot will be released back to the event capacity immediately."
        confirmText="Yes, Cancel Booking"
        cancelText="Keep Ticket"
        danger={true}
      />
    </div>
  );
};
