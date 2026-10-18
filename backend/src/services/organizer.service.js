import { query } from '../config/database.js';
import { formatEvent } from './event.service.js';

export const getOrganizerDashboardMetrics = async (organizerId) => {
  // 1. Total events, published, draft, past, today counts
  const eventCountsSql = `
    SELECT
      COUNT(*) as total_events,
      SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published_events,
      SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft_events,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_events,
      SUM(CASE WHEN status = 'past' OR end_datetime < NOW() THEN 1 ELSE 0 END) as past_events,
      SUM(CASE WHEN DATE(start_datetime) = CURRENT_DATE() THEN 1 ELSE 0 END) as today_events,
      SUM(CASE WHEN DATE(start_datetime) > CURRENT_DATE() AND status = 'published' THEN 1 ELSE 0 END) as upcoming_events
    FROM events
    WHERE organizer_id = ?
  `;
  const [eventCounts] = await query(eventCountsSql, [organizerId]);

  // 2. Total registrations and total capacity
  const regCountsSql = `
    SELECT
      COUNT(r.id) as total_registrations,
      COALESCE(SUM(e.capacity), 0) as total_capacity
    FROM events e
    LEFT JOIN registrations r ON e.id = r.event_id AND r.status = 'confirmed'
    WHERE e.organizer_id = ?
  `;
  const [regCounts] = await query(regCountsSql, [organizerId]);

  // 3. Upcoming events (next 5)
  const upcomingSql = `
    SELECT
      e.*,
      c.name as category_name,
      c.slug as category_slug,
      u.name as organizer_name,
      u.avatar as organizer_avatar,
      COALESCE((
        SELECT COUNT(*) FROM registrations r
        WHERE r.event_id = e.id AND r.status = 'confirmed'
      ), 0) as registered_count
    FROM events e
    JOIN categories c ON e.category_id = c.id
    JOIN users u ON e.organizer_id = u.id
    WHERE e.organizer_id = ? AND e.status = 'published' AND e.end_datetime >= NOW()
    ORDER BY e.start_datetime ASC
    LIMIT 5
  `;
  const upcomingRows = await query(upcomingSql, [organizerId]);

  // 4. Recent registrations
  const recentActivitySql = `
    SELECT
      r.id,
      r.booking_reference,
      r.ticket_type,
      r.status,
      r.registered_at,
      u.name as attendee_name,
      u.email as attendee_email,
      e.title as event_title,
      e.id as event_id
    FROM registrations r
    JOIN events e ON r.event_id = e.id
    JOIN users u ON r.attendee_id = u.id
    WHERE e.organizer_id = ?
    ORDER BY r.registered_at DESC
    LIMIT 10
  `;
  const recentActivity = await query(recentActivitySql, [organizerId]);

  // 5. Per-event performance breakdown
  const performanceSql = `
    SELECT
      e.id,
      e.title,
      e.capacity,
      e.price,
      e.status,
      e.start_datetime,
      COUNT(r.id) as confirmed_registrations,
      ROUND((COUNT(r.id) / NULLIF(e.capacity, 0)) * 100, 1) as occupancy_rate
    FROM events e
    LEFT JOIN registrations r ON e.id = r.event_id AND r.status = 'confirmed'
    WHERE e.organizer_id = ?
    GROUP BY e.id
    ORDER BY e.start_datetime DESC
    LIMIT 10
  `;
  const performance = await query(performanceSql, [organizerId]);

  const totalEvents = Number(eventCounts?.total_events || 0);
  const publishedEvents = Number(eventCounts?.published_events || 0);
  const draftEvents = Number(eventCounts?.draft_events || 0);
  const totalRegistrations = Number(regCounts?.total_registrations || 0);
  const totalCapacity = Number(regCounts?.total_capacity || 0);
  const avgOccupancy = totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0;

  return {
    metrics: {
      totalEvents,
      publishedEvents,
      draftEvents,
      pastEvents: Number(eventCounts?.past_events || 0),
      todayEvents: Number(eventCounts?.today_events || 0),
      upcomingEvents: Number(eventCounts?.upcoming_events || 0),
      totalRegistrations,
      totalCapacity,
      avgOccupancyRate: `${avgOccupancy}%`
    },
    upcomingEvents: upcomingRows.map(formatEvent),
    recentActivity: recentActivity.map(a => ({
      id: a.id,
      bookingRef: a.booking_reference,
      attendeeName: a.attendee_name,
      attendeeEmail: a.attendee_email,
      eventTitle: a.event_title,
      eventId: a.event_id,
      ticketType: a.ticket_type,
      status: a.status,
      registeredAt: a.registered_at
    })),
    eventPerformance: performance.map(p => ({
      eventId: p.id,
      title: p.title,
      capacity: Number(p.capacity),
      confirmedCount: Number(p.confirmed_registrations),
      occupancyRate: Number(p.occupancy_rate || 0),
      status: p.status
    }))
  };
};
