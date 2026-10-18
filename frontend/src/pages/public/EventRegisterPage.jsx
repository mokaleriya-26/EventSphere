import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Ticket,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  QrCode,
  User,
  Users,
  Building2,
  ExternalLink
} from 'lucide-react';

export const EventRegisterPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [ticketType, setTicketType] = useState('General Admission');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const event = eventService.getEventById(eventId);

  useEffect(() => {
    if (!user) {
      navigate(`/login?redirect=/events/${eventId}/register`, { replace: true });
    }
  }, [user, eventId, navigate]);

  if (!event) {
    return (
      <div className="app-container" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <h2>Event Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '12px 0 24px 0' }}>
          This event may have been removed or unpublished.
        </p>
        <Link to="/events" className="btn-primary">
          <ArrowLeft size={16} /> Return to All Events
        </Link>
      </div>
    );
  }

  // Live availability & rules check
  const availability = bookingService.getEventAvailability(event);
  const isPaid = event.priceType === 'paid' || event.price > 0;

  // Check if current user already registered
  const userBookings = user ? bookingService.getUserBookings(user.id) : [];
  const existingBooking = userBookings.find(
    b => b.eventId === event.id && b.status === 'confirmed'
  );

  const formattedDate = new Date(event.startDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const handleConfirmRegistration = async (e) => {
    e.preventDefault();
    setError('');

    if (isPaid) {
      setError('Paid event bookings are not yet enabled. Secure card payments are coming soon.');
      return;
    }

    if (!agreedTerms) {
      setError('Please acknowledge the event attendance terms before confirming.');
      return;
    }

    if (!availability.available) {
      setError(availability.reason || 'This event is not available for registration.');
      return;
    }

    setIsSubmitting(true);
    try {
      const booking = await bookingService.createBooking(event, user, ticketType);
      setConfirmedBooking(booking);
      showToast('Registration confirmed! Digital pass generated.', 'success');
    } catch (err) {
      setError(err.message || 'Registration failed.');
      showToast(err.message || 'Registration failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (confirmedBooking) {
    return (
      <div className="app-container" style={{ padding: '48px 24px 80px 24px', maxWidth: 680, margin: '0 auto' }}>
        <div
          className="card-surface"
          style={{
            borderRadius: 24,
            padding: '40px 36px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid #A7F3D0'
          }}
        >
          {/* Success Checkmark Badge */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'var(--accent-mint)',
              color: 'var(--accent-mint-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)'
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-mint-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            REGISTRATION CONFIRMED
          </span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 4, marginBottom: 8 }}>
            You're Going! 🎉
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', marginBottom: 28 }}>
            Your admission pass has been registered in the system. An in-app receipt has been generated.
          </p>

          {/* Digital Ticket Pass Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #FAF5FF 0%, #F5F3FF 100%)',
              border: '2px dashed #C4B5FD',
              borderRadius: 20,
              padding: '24px',
              textAlign: 'left',
              marginBottom: 32,
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--dark-purple)', textTransform: 'uppercase' }}>
                  BOOKING REFERENCE
                </span>
                <div style={{ fontSize: '1.4rem', fontFamily: 'monospace', fontWeight: 800, color: 'var(--dark-purple)' }}>
                  {confirmedBooking.bookingRef}
                </div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <QrCode size={28} color="var(--primary-purple)" />
              </div>
            </div>

            <div style={{ height: 1, background: '#E9D5FF', margin: '14px 0' }} />

            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>
              {event.title}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div><strong>Date & Time:</strong> {formattedDate} • {event.startTime}</div>
              <div><strong>Venue:</strong> {event.venue}, {event.city}</div>
              <div><strong>Attendee:</strong> {confirmedBooking.attendeeName} ({confirmedBooking.attendeeEmail})</div>
              <div><strong>Pass Tier:</strong> {confirmedBooking.ticketType} (Free Admission)</div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/attendee/bookings" className="btn-primary" style={{ padding: '12px 24px', fontSize: '0.95rem' }}>
              <Ticket size={18} /> View My Bookings
            </Link>
            <Link to={`/events/${event.id}`} className="btn-secondary" style={{ padding: '12px 24px', fontSize: '0.95rem' }}>
              Back to Event Details
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ALREADY REGISTERED STATE
  if (existingBooking) {
    return (
      <div className="app-container" style={{ padding: '48px 24px 80px 24px', maxWidth: 640, margin: '0 auto' }}>
        <div className="card-surface" style={{ padding: '40px', borderRadius: 24, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent-mint)', color: '#0E744F', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <CheckCircle2 size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>
            Already Registered
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: 20 }}>
            You have already secured your admission pass for this event with booking reference:
          </p>
          <div style={{ display: 'inline-block', background: 'var(--accent-lavender)', color: 'var(--dark-purple)', padding: '6px 18px', borderRadius: 10, fontFamily: 'monospace', fontWeight: 800, fontSize: '1.1rem', marginBottom: 28 }}>
            {existingBooking.bookingRef}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/attendee/bookings" className="btn-primary">
              <Ticket size={16} /> Open in My Bookings
            </Link>
            <Link to={`/events/${event.id}`} className="btn-secondary">
              Event Details
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ padding: '40px 24px 80px 24px', maxWidth: 840, margin: '0 auto' }}>
      {/* Back Link */}
      <Link
        to={`/events/${event.id}`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 24, fontWeight: 500 }}
      >
        <ArrowLeft size={16} /> Back to Event Overview
      </Link>

      {/* Organizer / Admin Role Notice */}
      {user && user.role !== 'attendee' && (
        <div
          style={{
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: 16,
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertCircle size={20} color="#2563EB" />
            <div style={{ fontSize: '0.88rem', color: '#1E40AF' }}>
              You are currently logged in as <strong>{user.role.toUpperCase()} ({user.name})</strong>.
              Event tickets should be booked with an attendee profile.
            </div>
          </div>
          <Link
            to="/login"
            className="btn-primary"
            style={{ padding: '6px 14px', fontSize: '0.82rem', background: '#2563EB', textDecoration: 'none' }}
          >
            Sign In with Attendee Account
          </Link>
        </div>
      )}

      {/* Main Registration Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 5fr) minmax(300px, 4fr)', gap: 32, alignItems: 'start' }}>
        {/* Left Form: Registration Details */}
        <div className="card-surface" style={{ padding: '32px', borderRadius: 24 }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 6 }}>
            {isPaid ? 'Checkout Preview' : 'Event Registration'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 24 }}>
            {isPaid
              ? 'Review ticket order details and platform reservation policies.'
              : 'Complete your free registration to confirm your spot.'}
          </p>

          {error && (
            <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '12px 16px', borderRadius: 12, fontSize: '0.86rem', marginBottom: 20 }}>
              {error}
            </div>
          )}

          {!availability.available && (
            <div style={{ background: '#FEF3C7', color: '#92400E', padding: '14px 18px', borderRadius: 14, fontSize: '0.88rem', marginBottom: 24, lineHeight: 1.5 }}>
              <strong>Registration Unavailable:</strong> {availability.reason}
            </div>
          )}

          {isPaid ? (
            /* PAID EVENT NOTICE & SAMPLE SUMMARY */
            <div>
              <div
                style={{
                  background: 'var(--accent-lavender)',
                  border: '1px solid #DDD6FE',
                  borderRadius: 16,
                  padding: '20px',
                  marginBottom: 24
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--dark-purple)', fontWeight: 700, marginBottom: 6 }}>
                  <CreditCard size={20} />
                  <span>Secure Payment Gateway Coming Soon</span>
                </div>
                <p style={{ color: 'var(--dark-purple)', fontSize: '0.86rem', lineHeight: 1.6, margin: 0 }}>
                  EventSphere payment processing with automated invoicing, credit card handling, and receipt generation
                  will launch in Phase 2. This event is priced at <strong>${event.price}</strong>.
                </p>
              </div>

              {/* Sample Order Summary */}
              <div style={{ background: '#F8FAFC', borderRadius: 14, padding: '18px', border: '1px solid var(--border-subtle)', marginBottom: 24 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 12 }}>
                  Sample Order Summary
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: 8 }}>
                  <span>1x General Admission</span>
                  <span>${event.price}.00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                  <span>Platform Processing Fee</span>
                  <span>$0.00 (Free in Demo)</span>
                </div>
                <div style={{ height: 1, background: '#E2E8F0', margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                  <span>Total Amount</span>
                  <span>${event.price}.00 USD</span>
                </div>
              </div>

              <button disabled className="btn-secondary" style={{ width: '100%', opacity: 0.65, cursor: 'not-allowed', padding: '12px' }}>
                Paid Booking Disabled in Demo Mode
              </button>
            </div>
          ) : (
            /* FREE REGISTRATION FORM */
            <form onSubmit={handleConfirmRegistration}>
              <div style={{ marginBottom: 18 }}>
                <label className="form-label">Attendee Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={user ? user.name : 'Sarah Jenkins'}
                  disabled
                  style={{ background: '#F8FAFC', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label className="form-label">Registered Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={user ? user.email : 'attendee@eventsphere.demo'}
                  disabled
                  style={{ background: '#F8FAFC', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ marginBottom: 22 }}>
                <label className="form-label">Select Ticket Tier</label>
                <select
                  className="form-control"
                  value={ticketType}
                  onChange={(e) => setTicketType(e.target.value)}
                >
                  <option value="General Admission">General Admission Pass (Free)</option>
                  <option value="Community Pass">Community / Student Pass (Free)</option>
                  <option value="VIP Early Access">VIP Early Access Pass (Free)</option>
                </select>
              </div>

              {/* Terms Checkbox */}
              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: 'var(--primary-purple)', marginTop: 2, flexShrink: 0 }}
                  />
                  <span>
                    I agree to the EventSphere attendance policies and confirm that I will present my digital pass at the entrance.
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <Link to={`/events/${event.id}`} className="btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting || !availability.available}
                  className="btn-primary"
                  style={{ flex: 2, padding: '12px', fontSize: '0.96rem' }}
                >
                  <CheckCircle2 size={16} />
                  <span>{isSubmitting ? 'Confirming...' : 'Confirm Registration'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Event Summary Card */}
        <div className="card-surface" style={{ padding: '24px', borderRadius: 22 }}>
          <div style={{ width: '100%', height: 160, borderRadius: 16, overflow: 'hidden', marginBottom: 18, background: '#F1F5F9' }}>
            <img
              src={event.coverImage}
              alt={event.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-purple)', textTransform: 'uppercase', marginBottom: 4 }}>
            {event.categoryName}
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.35, marginBottom: 14 }}>
            {event.title}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={15} color="var(--primary-purple)" />
              <span>{formattedDate}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={15} color="var(--primary-purple)" />
              <span>{event.startTime} - {event.endTime}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <MapPin size={15} color="var(--primary-purple)" style={{ marginTop: 2, flexShrink: 0 }} />
              <span>{event.venue}, {event.city}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={15} color="var(--primary-purple)" />
              <span>
                {availability.remainingSpots} spots remaining (of {event.capacity})
              </span>
            </div>
          </div>

          <div style={{ paddingTop: 14, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>Price</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: isPaid ? 'var(--dark-purple)' : '#0E744F' }}>
              {isPaid ? `$${event.price}` : 'Free'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
