import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { categoryService } from '../../services/categoryService';
import { EventCard } from '../../components/events/EventCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Search, Filter, SlidersHorizontal, Calendar, MapPin, Tag } from 'lucide-react';

export const EventsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialQuery = searchParams.get('q') || '';
  const initialPriceType = searchParams.get('priceType') || 'all';
  const initialDateFilter = searchParams.get('dateFilter') || 'all';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedPrice, setSelectedPrice] = useState(initialPriceType);
  const [selectedDate, setSelectedDate] = useState(initialDateFilter);
  const [selectedCity, setSelectedCity] = useState('all');
  const [sortBy, setSortBy] = useState('upcoming');

  const categories = categoryService.getActiveCategories();

  const [allEvents, setAllEvents] = useState(() => eventService.getAllEvents());

  React.useEffect(() => {
    eventService.syncFromBackend().then((evts) => {
      setAllEvents(evts || []);
    });
  }, []);

  // Compute filtered events
  const filteredEvents = useMemo(() => {
    return eventService.searchEvents({
      query,
      category: selectedCategory,
      priceType: selectedPrice,
      dateFilter: selectedDate,
      city: selectedCity,
      sort: sortBy
    }).filter(e => e.status === 'published');
  }, [allEvents, query, selectedCategory, selectedPrice, selectedDate, selectedCity, sortBy]);

  // Unique cities from events
  const cities = Array.from(new Set(allEvents.map(e => e.city).filter(Boolean)));

  const handleResetFilters = () => {
    setQuery('');
    setSelectedCategory('all');
    setSelectedPrice('all');
    setSelectedDate('all');
    setSelectedCity('all');
    setSortBy('upcoming');
  };

  return (
    <div className="app-container" style={{ padding: '40px 24px 80px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: 6 }}>
          Explore Events
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Browse conferences, performances, workshops, and gatherings across top cities.
        </p>
      </div>

      {/* Search & Top Controls */}
      <div
        className="card-surface"
        style={{
          padding: '16px 20px',
          borderRadius: 20,
          marginBottom: 24,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
          <Search size={18} color="var(--primary-purple)" />
          <input
            type="text"
            placeholder="Search by event title, venue, or description..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '0.95rem',
              color: 'var(--text-main)'
            }}
          />
        </div>

        {/* City Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MapPin size={16} color="var(--text-secondary)" />
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="form-control"
            style={{ padding: '6px 14px', width: 'auto', borderRadius: 9999, fontSize: '0.85rem' }}
          >
            <option value="all">All Cities</option>
            {cities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={16} color="var(--text-secondary)" />
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="form-control"
            style={{ padding: '6px 14px', width: 'auto', borderRadius: 9999, fontSize: '0.85rem' }}
          >
            <option value="all">Any Date</option>
            <option value="upcoming">Upcoming</option>
            <option value="today">Today</option>
            <option value="past">Past Events</option>
          </select>
        </div>

        {/* Price Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tag size={16} color="var(--text-secondary)" />
          <select
            value={selectedPrice}
            onChange={(e) => setSelectedPrice(e.target.value)}
            className="form-control"
            style={{ padding: '6px 14px', width: 'auto', borderRadius: 9999, fontSize: '0.85rem' }}
          >
            <option value="all">All Prices</option>
            <option value="free">Free Events Only</option>
            <option value="paid">Paid Events</option>
          </select>
        </div>

        {/* Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SlidersHorizontal size={16} color="var(--text-secondary)" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-control"
            style={{ padding: '6px 14px', width: 'auto', borderRadius: 9999, fontSize: '0.85rem' }}
          >
            <option value="upcoming">Date (Soonest)</option>
            <option value="newest">Newly Listed</option>
            <option value="popular">Most Registered</option>
          </select>
        </div>
      </div>

      {/* Category Chips Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 14,
          marginBottom: 28
        }}
      >
        <button
          onClick={() => setSelectedCategory('all')}
          className={`pill-tab ${selectedCategory === 'all' ? 'active' : ''}`}
          style={{
            background: selectedCategory === 'all' ? 'var(--dark-purple)' : '#FFFFFF',
            color: selectedCategory === 'all' ? '#FFFFFF' : 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)',
            whiteSpace: 'nowrap'
          }}
        >
          All Categories ({allEvents.filter(e => e.status === 'published').length})
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.slug)}
            className={`pill-tab ${selectedCategory === cat.slug ? 'active' : ''}`}
            style={{
              background: selectedCategory === cat.slug ? 'var(--dark-purple)' : '#FFFFFF',
              color: selectedCategory === cat.slug ? '#FFFFFF' : 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              whiteSpace: 'nowrap'
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <span style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
          Showing <strong>{filteredEvents.length}</strong> {filteredEvents.length === 1 ? 'event' : 'events'}
        </span>
        {(query || selectedCategory !== 'all' || selectedPrice !== 'all' || selectedDate !== 'all' || selectedCity !== 'all') && (
          <button
            onClick={handleResetFilters}
            style={{ fontSize: '0.85rem', color: 'var(--primary-purple)', fontWeight: 600 }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Event Grid or Empty State */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          title="No events match your search criteria"
          description="Try removing one of your filters or searching with a different keyword."
          actionText="Clear All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="grid-4">
          {filteredEvents.map((evt) => (
            <EventCard key={evt.id} event={evt} />
          ))}
        </div>
      )}
    </div>
  );
};
