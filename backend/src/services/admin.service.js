import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { formatEvent } from './event.service.js';

export const getAdminStats = async () => {
  const [usersCount] = await query('SELECT COUNT(*) as total, SUM(CASE WHEN role = "organizer" THEN 1 ELSE 0 END) as organizers, SUM(CASE WHEN role = "attendee" THEN 1 ELSE 0 END) as attendees, SUM(CASE WHEN role = "admin" THEN 1 ELSE 0 END) as admins FROM users');
  const [eventsCount] = await query(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = "published" THEN 1 ELSE 0 END) as published,
      SUM(CASE WHEN status = "draft" THEN 1 ELSE 0 END) as draft,
      SUM(CASE WHEN status = "cancelled" THEN 1 ELSE 0 END) as cancelled,
      SUM(CASE WHEN status = "past" THEN 1 ELSE 0 END) as past,
      SUM(CASE WHEN DATE(start_datetime) = CURRENT_DATE() THEN 1 ELSE 0 END) as today,
      SUM(CASE WHEN DATE(start_datetime) > CURRENT_DATE() THEN 1 ELSE 0 END) as future
    FROM events
  `);
  const [bookingsCount] = await query('SELECT COUNT(*) as total, SUM(CASE WHEN status = "confirmed" THEN 1 ELSE 0 END) as confirmed FROM registrations');
  const [categoriesCount] = await query('SELECT COUNT(*) as total, SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active FROM categories');

  const recentEvents = await query(`
    SELECT e.id, e.title, e.status, e.capacity, e.created_at as createdAt,
           u.name as organizerName, u.organization as organizationName,
           (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'confirmed') as registeredCount
    FROM events e
    JOIN users u ON e.organizer_id = u.id
    ORDER BY e.created_at DESC
    LIMIT 6
  `);

  const recentRegistrations = await query(`
    SELECT r.id, r.booking_reference as bookingRef, r.status, r.registered_at as registeredAt,
           u.name as attendeeName, u.email as attendeeEmail,
           e.title as eventTitle
    FROM registrations r
    JOIN users u ON r.attendee_id = u.id
    JOIN events e ON r.event_id = e.id
    ORDER BY r.registered_at DESC
    LIMIT 6
  `);

  return {
    users: {
      total: Number(usersCount?.total || 0),
      organizers: Number(usersCount?.organizers || 0),
      attendees: Number(usersCount?.attendees || 0),
      admins: Number(usersCount?.admins || 0)
    },
    events: {
      total: Number(eventsCount?.total || 0),
      published: Number(eventsCount?.published || 0),
      draft: Number(eventsCount?.draft || 0),
      cancelled: Number(eventsCount?.cancelled || 0),
      past: Number(eventsCount?.past || 0),
      today: Number(eventsCount?.today || 0),
      future: Number(eventsCount?.future || 0)
    },
    bookings: {
      total: Number(bookingsCount?.total || 0),
      confirmed: Number(bookingsCount?.confirmed || 0)
    },
    categories: {
      total: Number(categoriesCount?.total || 0),
      active: Number(categoriesCount?.active || 0)
    },
    recentEvents,
    recentRegistrations
  };
};

export const listAllUsers = async ({ role = '', status = '', search = '' } = {}) => {
  let whereClauses = [];
  let params = [];

  if (role && role !== 'all') {
    whereClauses.push('role = ?');
    params.push(role);
  }

  if (status && status !== 'all') {
    whereClauses.push('account_status = ?');
    params.push(status);
  }

  if (search && search.trim()) {
    whereClauses.push('(LOWER(name) LIKE ? OR LOWER(email) LIKE ?)');
    const term = `%${search.trim().toLowerCase()}%`;
    params.push(term, term);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const rows = await query(
    `SELECT id, name, email, role, organization, avatar, city, bio, account_status as status, created_at as registeredAt
     FROM users
     ${whereSql}
     ORDER BY created_at DESC`,
    params
  );

  return rows;
};

export const toggleUserStatus = async (userId, currentAdminId) => {
  if (userId === currentAdminId) {
    throw new AppError('Action prevented: You cannot suspend your own active administrator account.', 400);
  }

  const rows = await query('SELECT id, account_status FROM users WHERE id = ? LIMIT 1', [userId]);
  if (rows.length === 0) throw new AppError('User not found.', 404);

  const newStatus = rows[0].account_status === 'suspended' ? 'active' : 'suspended';
  await query('UPDATE users SET account_status = ? WHERE id = ?', [newStatus, userId]);

  const updatedRows = await query(
    `SELECT id, name, email, role, organization, avatar, city, bio, account_status as status, created_at as registeredAt
     FROM users WHERE id = ? LIMIT 1`,
    [userId]
  );

  return updatedRows[0];
};

export const listAllEventsAdmin = async ({ status = '', category = '' } = {}) => {
  let whereClauses = [];
  let params = [];

  if (status && status !== 'all') {
    whereClauses.push('e.status = ?');
    params.push(status);
  }

  if (category && category !== 'all') {
    whereClauses.push('(c.id = ? OR c.slug = ?)');
    params.push(category, category);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const sql = `
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
    ${whereSql}
    ORDER BY e.created_at DESC
  `;

  const rows = await query(sql, params);
  return rows.map(formatEvent);
};

export const moderateEventStatus = async (eventId, status) => {
  const rows = await query('SELECT id FROM events WHERE id = ? LIMIT 1', [eventId]);
  if (rows.length === 0) throw new AppError('Event not found.', 404);

  await query('UPDATE events SET status = ? WHERE id = ?', [status, eventId]);
  const updated = await query(
    `SELECT
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
    WHERE e.id = ? LIMIT 1`,
    [eventId]
  );
  return formatEvent(updated[0]);
};
