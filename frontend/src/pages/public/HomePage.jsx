import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { eventService } from '../../services/eventService';
import { categoryService } from '../../services/categoryService';
import { EventCard } from '../../components/events/EventCard';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import {
  Search,
  Sparkles,
  ArrowRight,
  Calendar,
  Compass,
  Users,
  CheckCircle,
  PlusCircle,
  Ticket
} from 'lucide-react';

export const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const categories = categoryService.getActiveCategories();
  const [allEvents, setAllEvents] = useState(() => eventService.getPublicEvents());

  React.useEffect(() => {
    eventService.syncFromBackend().then(() => {
      setAllEvents(eventService.getPublicEvents());
    });
  }, []);

  const featuredEvents = allEvents.filter(e => e.featured).slice(0, 4);
  const upcomingEvents = allEvents.slice(0, 6);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/events');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '80px 0 60px 0',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F6F7FC 100%)',
          overflow: 'hidden'
        }}
      >
        {/* Soft pastel aura background blobs */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: '10%',
            width: 480,
            height: 480,
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--accent-lavender) 0%, rgba(233, 224, 255, 0) 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none'
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            left: '5%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--accent-mint) 0%, rgba(216, 245, 234, 0) 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none'
          }}
        />

        <div className="app-container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--accent-lavender)',
              color: 'var(--dark-purple)',
              padding: '6px 16px',
              borderRadius: 9999,
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: 20
            }}
          >
            <Sparkles size={16} /> Discover What’s Happening Near You
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              maxWidth: 780,
              margin: '0 auto 20px auto'
            }}
          >
            Find your next <span style={{ color: 'var(--primary-purple)' }}>experience.</span>
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              color: 'var(--text-secondary)',
              maxWidth: 620,
              margin: '0 auto 36px auto',
              lineHeight: 1.6
            }}
          >
            Connect with vibrant tech summits, acoustic jazz concerts, executive workshops,
            cultural showcases, and wellness retreats curated just for you.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              maxWidth: 640,
              margin: '0 auto 28px auto',
              background: '#FFFFFF',
              borderRadius: 9999,
              padding: '8px 12px 8px 24px',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <Search size={20} color="var(--primary-purple)" />
            <input
              type="text"
              placeholder="Search by event title, city (Mumbai, Pune...), or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                color: 'var(--text-main)',
                fontSize: '0.98rem'
              }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '12px 26px', fontSize: '0.95rem' }}>
              Explore Events
            </button>
          </form>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={16} color="#10B981" /> 2,400+ Verified Attendees
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={16} color="#10B981" /> 8 Diverse Categories
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={16} color="#10B981" /> Free Instant Registration
            </span>
          </div>
        </div>
      </section>

      {/* Categories Horizontal Showcase */}
      <section style={{ padding: '48px 0', background: '#FFFFFF', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="app-container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Browse by Category
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Find experiences that match your passions
              </p>
            </div>
            <Link to="/categories" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary-purple)', fontWeight: 600, fontSize: '0.9rem' }}>
              <span>View all categories</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: 16
            }}
          >
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/categories/${cat.slug}`}
                style={{
                  background: 'var(--bg-page)',
                  borderRadius: 16,
                  padding: '20px 14px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                  border: '1px solid var(--border-subtle)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = 'var(--primary-purple)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    background: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: cat.color || 'var(--primary-purple)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}
                >
                  <CategoryIcon name={cat.iconName} size={22} />
                </div>
                <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.3 }}>
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section style={{ padding: '64px 0', background: 'var(--bg-page)' }}>
        <div className="app-container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary-purple)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <Sparkles size={14} /> Hand-Picked Highlights
              </div>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 4 }}>
                Featured Experiences
              </h2>
            </div>
            <Link to="/events" className="btn-secondary" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
              View All
            </Link>
          </div>

          <div className="grid-4">
            {featuredEvents.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section style={{ padding: '64px 0', background: '#FFFFFF', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="app-container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Upcoming Events
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                Join sessions and live gatherings happening soon
              </p>
            </div>
            <Link to="/events?dateFilter=upcoming" className="btn-secondary" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
              Explore Schedule
            </Link>
          </div>

          <div className="grid-3">
            {upcomingEvents.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        </div>
      </section>

      {/* Call to action for organizers */}
      <section
        style={{
          padding: '72px 0',
          background: 'linear-gradient(135deg, var(--dark-purple) 0%, var(--primary-purple) 100%)',
          color: '#FFFFFF'
        }}
      >
        <div className="app-container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>
            Hosting a summit, gig or workshop?
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255, 255, 255, 0.85)', maxWidth: 580, margin: '0 auto 32px auto', lineHeight: 1.6 }}>
            Publish your event in minutes, track attendee registrations, monitor capacity in real-time,
            and export detailed rosters with EventSphere.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            {user?.role === 'organizer' ? (
              <>
                <Link
                  to="/organizer/events/new"
                  style={{
                    background: '#FFFFFF',
                    color: 'var(--dark-purple)',
                    padding: '12px 28px',
                    borderRadius: 9999,
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 18px rgba(0,0,0,0.2)'
                  }}
                >
                  <PlusCircle size={18} /> Publish an Event
                </Link>
                <Link
                  to="/organizer/dashboard"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    padding: '12px 24px',
                    borderRadius: 9999,
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                >
                  Organizer Dashboard
                </Link>
              </>
            ) : user?.role === 'admin' ? (
              <>
                <Link
                  to="/admin/events"
                  style={{
                    background: '#FFFFFF',
                    color: 'var(--dark-purple)',
                    padding: '12px 28px',
                    borderRadius: 9999,
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 18px rgba(0,0,0,0.2)'
                  }}
                >
                  Manage Events
                </Link>
                <Link
                  to="/admin/dashboard"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    padding: '12px 24px',
                    borderRadius: 9999,
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                >
                  Admin Dashboard
                </Link>
              </>
            ) : user?.role === 'attendee' ? (
              <>
                <Link
                  to="/events"
                  style={{
                    background: '#FFFFFF',
                    color: 'var(--dark-purple)',
                    padding: '12px 28px',
                    borderRadius: 9999,
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 18px rgba(0,0,0,0.2)'
                  }}
                >
                  <Compass size={18} /> Explore All Events
                </Link>
                <Link
                  to="/attendee/bookings"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    padding: '12px 24px',
                    borderRadius: 9999,
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                >
                  <Ticket size={18} /> My Registrations
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/events"
                  style={{
                    background: '#FFFFFF',
                    color: 'var(--dark-purple)',
                    padding: '12px 28px',
                    borderRadius: 9999,
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 18px rgba(0,0,0,0.2)'
                  }}
                >
                  <Compass size={18} /> Explore Events
                </Link>
                <Link
                  to="/login"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    padding: '12px 24px',
                    borderRadius: 9999,
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                >
                  Sign In to EventSpear
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
