import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { eventService } from '../../services/eventService';
import { EventCard } from '../../components/events/EventCard';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  PlusCircle,
  SlidersHorizontal,
  Calendar,
  Layers,
  CheckCircle,
  XCircle,
  Trash2,
  Clock
} from 'lucide-react';

import { apiClient } from '../../services/apiClient';

export const OrganizerEvents = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'ongoing', 'upcoming', 'past', 'drafts'
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Load events owned by this organizer
  const organizerId = user?.id || 'usr-organizer';
  const [events, setEvents] = useState(() => eventService.getOrganizerEventsSync(organizerId));

  const refreshEvents = async () => {
    try {
      const data = await eventService.getOrganizerEvents(organizerId);
      if (Array.isArray(data)) {
        setEvents(data);
      }
    } catch {
      setEvents(eventService.getOrganizerEventsSync(organizerId));
    }
  };

  React.useEffect(() => {
    refreshEvents();
  }, [organizerId]);

  const today = new Date().toISOString().split('T')[0];

  // Tab counts
  const counts = useMemo(() => {
    const list = Array.isArray(events) ? events : [];
    const all = list.length;
    const upcoming = list.filter(e => e.status === 'published' && e.startDate >= today).length;
    const ongoing = list.filter(e => e.startDate === today && e.status === 'published').length;
    const past = list.filter(e => e.startDate < today || e.status === 'past').length;
    const drafts = list.filter(e => e.status === 'draft').length;
    return { all, upcoming, ongoing, past, drafts };
  }, [events, today]);

  // Filtered list
  const displayedEvents = useMemo(() => {
    const list = Array.isArray(events) ? events : [];
    return list.filter(e => {
      // Tab filter
      if (activeTab === 'upcoming' && (e.status !== 'published' || e.startDate < today)) return false;
      if (activeTab === 'ongoing' && (e.startDate !== today || e.status !== 'published')) return false;
      if (activeTab === 'past' && e.startDate >= today && e.status !== 'past') return false;
      if (activeTab === 'drafts' && e.status !== 'draft') return false;

      // Category filter
      if (categoryFilter !== 'all' && e.categoryId !== categoryFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          e.title.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.city.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [events, activeTab, categoryFilter, searchQuery, today]);

  const handleStatusChange = async (eventId, newStatus) => {
    try {
      await eventService.updateEventStatus(eventId, newStatus);
      refreshEvents();
      showToast(`Event status updated to ${newStatus.toUpperCase()}`, 'success');
    } catch (err) {
      showToast(err.message || 'Status update failed.', 'error');
    }
  };

  return (
    <div>
      {/* Top Controls Bar (Matching reference screenshot closely!) */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 24
        }}
      >
        {/* Pill-shaped Tabs on the Left */}
        <div className="pill-tabs">
          <button
            onClick={() => setActiveTab('all')}
            className={`pill-tab ${activeTab === 'all' ? 'active' : ''}`}
          >
            All ({counts.all})
          </button>
          <button
            onClick={() => setActiveTab('ongoing')}
            className={`pill-tab ${activeTab === 'ongoing' ? 'active' : ''}`}
          >
            Ongoing ({counts.ongoing})
          </button>
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
            Past ({counts.past})
          </button>
          {counts.drafts > 0 && (
            <button
              onClick={() => setActiveTab('drafts')}
              className={`pill-tab ${activeTab === 'drafts' ? 'active' : ''}`}
            >
              Drafts ({counts.drafts})
            </button>
          )}
        </div>

        {/* Right Search, Filter & Add Event Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Search Input Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#FFFFFF',
              borderRadius: 9999,
              padding: '6px 14px',
              border: '1px solid #ECECF4',
              boxShadow: '0 2px 6px rgba(41, 40, 58, 0.03)'
            }}
          >
            <Search size={15} color="#858594" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.84rem', width: 120, color: 'var(--text-main)' }}
            />
          </div>

          {/* Filter Button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: showFilterDropdown ? '#E9E0FF' : '#FFFFFF',
                border: '1px solid #ECECF4',
                boxShadow: '0 2px 6px rgba(41, 40, 58, 0.03)',
                transition: 'all 0.2s'
              }}
              title="Filter categories"
            >
              <SlidersHorizontal size={15} color="var(--primary-violet)" />
            </button>

            {showFilterDropdown && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 44,
                  background: '#FFFFFF',
                  borderRadius: 14,
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--border-subtle)',
                  padding: 12,
                  width: 220,
                  zIndex: 40
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
                  Filter by Category:
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setShowFilterDropdown(false);
                  }}
                  className="form-control"
                  style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                >
                  <option value="all">All Categories</option>
                  <option value="cat-tech">Tech Events</option>
                  <option value="cat-business">Business & Networking</option>
                  <option value="cat-concerts">Concerts & Music</option>
                  <option value="cat-cultural">Cultural Events</option>
                  <option value="cat-workshops">Workshops & Learning</option>
                  <option value="cat-sports">Sports & Fitness</option>
                  <option value="cat-food">Food & Lifestyle</option>
                  <option value="cat-comedy">Comedy & Entertainment</option>
                </select>
              </div>
            )}
          </div>

          {/* Grid / List Mode Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#FFFFFF',
              borderRadius: 9999,
              padding: 2,
              border: '1px solid #ECECF4',
              boxShadow: '0 2px 6px rgba(41, 40, 58, 0.03)'
            }}
          >
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '6px 8px',
                borderRadius: 9999,
                background: viewMode === 'grid' ? '#E9E0FF' : 'transparent',
                color: viewMode === 'grid' ? 'var(--primary-violet)' : '#858594',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Grid view"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '6px 8px',
                borderRadius: 9999,
                background: viewMode === 'list' ? '#E9E0FF' : 'transparent',
                color: viewMode === 'list' ? 'var(--primary-violet)' : '#858594',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="List view"
            >
              <List size={15} />
            </button>
          </div>

          {/* Purple Add Event Button (matching screenshot) */}
          <Link
            to="/organizer/events/new"
            className="btn-primary"
            style={{
              padding: '8px 18px',
              fontSize: '0.86rem',
              fontWeight: 600,
              gap: 6,
              background: 'var(--primary-violet)'
            }}
          >
            <PlusCircle size={15} />
            <span>Add Event</span>
          </Link>
        </div>
      </div>

      {/* Main Events Grid / List */}
      {displayedEvents.length === 0 ? (
        <EmptyState
          title="No events in this view"
          description="You don't have any events matching the selected tab and filters. Ready to publish your next experience?"
          actionText="Create New Event"
          onAction={() => navigate('/organizer/events/new')}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid-4">
          {displayedEvents.map((evt) => (
            <EventCard
              key={evt.id}
              event={evt}
              isOrganizerView={true}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      ) : (
        /* List Mode View */
        <div className="card-surface" style={{ borderRadius: 18, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Event</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Category</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Date & Venue</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Registrations</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedEvents.map((evt) => (
                  <tr key={evt.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img
                          src={evt.coverImage}
                          alt={evt.title}
                          style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{evt.title}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{evt.priceType === 'free' ? 'Free Event' : `$${evt.price}`}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {evt.categoryName}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600 }}>{evt.startDate}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{evt.venue}, {evt.city}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--primary-purple)' }}>
                        {evt.registeredCount} / {evt.capacity}
                      </div>
                      <div style={{ width: 90, height: 4, background: '#E5E7EB', borderRadius: 9999, marginTop: 4 }}>
                        <div
                          style={{
                            width: `${Math.min(100, Math.round((evt.registeredCount / evt.capacity) * 100))}%`,
                            height: '100%',
                            background: 'var(--primary-purple)',
                            borderRadius: 9999
                          }}
                        />
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        className={`badge-pill ${
                          evt.status === 'published' ? 'badge-mint' : evt.status === 'draft' ? 'badge-amber' : 'badge-red'
                        }`}
                      >
                        {evt.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 8 }}>
                        <Link
                          to={`/organizer/events/${evt.id}/edit`}
                          className="btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                        >
                          Edit
                        </Link>
                        <Link
                          to={`/organizer/events/${evt.id}/attendees`}
                          className="btn-primary"
                          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                        >
                          Attendees
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
