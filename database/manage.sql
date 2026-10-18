-- ========================================================
-- EventSpear Database Management Workbench
-- File: database/manage.sql
-- 
-- Open this file directly in your MySQL extension in VS Code / IDE.
-- You can highlight any query or click "Execute" (Ctrl+Enter / Cmd+Enter)
-- to run queries against `eventspear_local`.
-- ========================================================

USE `eventspear_local`;

-- ========================================================
-- 1. OVERVIEW & TABLE COUNTS
-- ========================================================

-- List all tables in the database
SHOW TABLES;

-- Summary of row counts across all tables
SELECT 'users' AS `Table`, COUNT(*) AS `Total_Rows` FROM users
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'events', COUNT(*) FROM events
UNION ALL
SELECT 'registrations', COUNT(*) FROM registrations
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT '_migrations', COUNT(*) FROM _migrations;

-- ========================================================
-- 2. INSPECT USERS
-- ========================================================

-- View all users sorted by role and name
SELECT 
    id, 
    name, 
    email, 
    role, 
    account_status, 
    organization, 
    created_at 
FROM users 
ORDER BY FIELD(role, 'admin', 'organizer', 'attendee'), created_at DESC;

-- Filter by role
SELECT id, name, email, role, organization FROM users WHERE role = 'organizer';
SELECT id, name, email, role, city FROM users WHERE role = 'attendee';
SELECT id, name, email, role FROM users WHERE role = 'admin';

-- ========================================================
-- 3. INSPECT EVENTS
-- ========================================================

-- View all events with organizer details and category name
SELECT 
    e.id AS event_id,
    e.title,
    c.name AS category,
    u.name AS organizer_name,
    e.status,
    e.start_time,
    e.capacity,
    (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'confirmed') AS confirmed_attendees,
    e.city
FROM events e
LEFT JOIN categories c ON e.category_id = c.id
LEFT JOIN users u ON e.organizer_id = u.id
ORDER BY e.start_time ASC;

-- Events occurring today
SELECT id, title, start_time, end_time, venue, city 
FROM events 
WHERE DATE(start_time) = CURRENT_DATE();

-- Upcoming future events
SELECT id, title, start_time, capacity, city 
FROM events 
WHERE start_time > NOW() 
ORDER BY start_time ASC;

-- Past events
SELECT id, title, start_time, city 
FROM events 
WHERE end_time < NOW() 
ORDER BY start_time DESC;

-- ========================================================
-- 4. INSPECT REGISTRATIONS
-- ========================================================

-- View all registrations with attendee and event information
SELECT 
    r.id AS registration_id,
    u.name AS attendee_name,
    u.email AS attendee_email,
    e.title AS event_title,
    e.start_time AS event_date,
    r.status AS registration_status,
    r.ticket_code,
    r.registered_at
FROM registrations r
JOIN users u ON r.user_id = u.id
JOIN events e ON r.event_id = e.id
ORDER BY r.registered_at DESC;

-- ========================================================
-- 5. HELPFUL MANAGEMENT TEMPLATES
-- ========================================================

-- Template: Activate or suspend a user account
-- UPDATE users SET account_status = 'suspended' WHERE email = 'user_to_suspend@eventspear.local';
-- UPDATE users SET account_status = 'active' WHERE email = 'user_to_activate@eventspear.local';

-- Template: Cancel an event
-- UPDATE events SET status = 'cancelled' WHERE id = 'target_event_id';

-- Template: Manually cancel a registration
-- UPDATE registrations SET status = 'cancelled', cancelled_at = NOW() WHERE id = 'target_registration_id';

-- Template: Add a new custom category
-- INSERT INTO categories (id, name, slug, description, icon_name, color, is_active)
-- VALUES ('cat-sports', 'Sports & Fitness', 'sports', 'Marathons, yoga retreats, and tournaments', 'Activity', '#E11D48', 1);

-- ========================================================
-- 6. RESET & CLEANUP (USE WITH CAUTION)
-- ========================================================

-- To wipe only transactional data while keeping users and categories:
-- DELETE FROM notifications;
-- DELETE FROM registrations;
-- DELETE FROM events;
