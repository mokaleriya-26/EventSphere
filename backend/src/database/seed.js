import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';
import {
  SEED_CATEGORIES,
  SEED_USERS,
  SEED_EVENTS,
  SEED_REGISTRATIONS,
  SEED_NOTIFICATIONS
} from '../../seeds/seedData.js';

export async function seedDatabase() {
  if (env.NODE_ENV === 'production' && process.env.ALLOW_PROD_SEED !== 'true') {
    console.error('❌ [Seed Safety] Seeding demo accounts is disabled in production. Set ALLOW_PROD_SEED=true to override.');
    throw new Error('Database seeding disabled in production.');
  }

  console.log(`[Seed] Connecting to MySQL '${env.DB_NAME}' at ${env.DB_HOST}:${env.DB_PORT}...`);

  let dbConn;
  try {
    dbConn = await mysql.createConnection({
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      multipleStatements: true
    });
  } catch (connErr) {
    console.error('\n❌ [Seed Connection Error]:', connErr.message);
    if (connErr.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Hint: MySQL rejected credentials. Please check DB_PASSWORD in backend/.env.');
    } else if (connErr.code === 'ER_BAD_DB_ERROR') {
      console.error('💡 Hint: Database does not exist yet. Please run migrations first: npm run migrate');
    }
    throw connErr;
  }

  try {
    // 1. Seed Categories
    console.log('[Seed] Seeding categories...');
    for (const cat of SEED_CATEGORIES) {
      await dbConn.execute(
        `INSERT INTO categories (id, name, slug, description, icon_name, color, badge_text, cover_image_url, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           description = VALUES(description),
           icon_name = VALUES(icon_name),
           color = VALUES(color),
           badge_text = VALUES(badge_text),
           cover_image_url = VALUES(cover_image_url),
           is_active = VALUES(is_active);`,
        [
          cat.id,
          cat.name,
          cat.slug,
          cat.description,
          cat.icon_name,
          cat.color,
          cat.badge_text,
          cat.cover_image_url,
          cat.is_active
        ]
      );
    }
    console.log(`[Seed] Seeded ${SEED_CATEGORIES.length} categories.`);

    // 2. Seed Users
    console.log('[Seed] Seeding users...');
    for (const u of SEED_USERS) {
      await dbConn.execute(
        `INSERT INTO users (id, name, email, password_hash, role, organization, avatar, city, bio, account_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           password_hash = VALUES(password_hash),
           role = VALUES(role),
           organization = VALUES(organization),
           avatar = VALUES(avatar),
           city = VALUES(city),
           bio = VALUES(bio),
           account_status = VALUES(account_status);`,
        [
          u.id,
          u.name,
          u.email,
          u.password_hash,
          u.role,
          u.organization,
          u.avatar,
          u.city,
          u.bio,
          u.account_status
        ]
      );
    }
    console.log(`[Seed] Seeded ${SEED_USERS.length} demo users.`);

    // 3. Seed Events
    console.log('[Seed] Seeding sample events...');
    for (const evt of SEED_EVENTS) {
      await dbConn.execute(
        `INSERT INTO events (
          id, organizer_id, category_id, title, slug, summary, description,
          cover_image_url, start_datetime, end_datetime, venue_name, address,
          city, event_type, capacity, price, currency, status, featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          summary = VALUES(summary),
          description = VALUES(description),
          cover_image_url = VALUES(cover_image_url),
          start_datetime = VALUES(start_datetime),
          end_datetime = VALUES(end_datetime),
          venue_name = VALUES(venue_name),
          address = VALUES(address),
          city = VALUES(city),
          event_type = VALUES(event_type),
          capacity = VALUES(capacity),
          price = VALUES(price),
          currency = VALUES(currency),
          status = VALUES(status),
          featured = VALUES(featured);`,
        [
          evt.id,
          evt.organizer_id,
          evt.category_id,
          evt.title,
          evt.slug,
          evt.summary,
          evt.description,
          evt.cover_image_url,
          evt.start_datetime,
          evt.end_datetime,
          evt.venue_name,
          evt.address,
          evt.city,
          evt.event_type,
          evt.capacity,
          evt.price,
          evt.currency,
          evt.status,
          evt.featured
        ]
      );
    }
    console.log(`[Seed] Seeded ${SEED_EVENTS.length} events.`);

    // 4. Seed Registrations
    console.log('[Seed] Seeding sample registrations...');
    for (const reg of SEED_REGISTRATIONS) {
      await dbConn.execute(
        `INSERT INTO registrations (
          id, event_id, attendee_id, booking_reference, ticket_type, price, status, registered_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          ticket_type = VALUES(ticket_type),
          status = VALUES(status);`,
        [
          reg.id,
          reg.event_id,
          reg.attendee_id,
          reg.booking_reference,
          reg.ticket_type,
          reg.price,
          reg.status,
          reg.registered_at
        ]
      );
    }
    console.log(`[Seed] Seeded ${SEED_REGISTRATIONS.length} registrations.`);

    // 5. Seed Notifications
    console.log('[Seed] Seeding sample notifications...');
    for (const notif of SEED_NOTIFICATIONS) {
      await dbConn.execute(
        `INSERT INTO notifications (
          id, user_id, title, message, type, link, is_read
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          message = VALUES(message),
          is_read = VALUES(is_read);`,
        [
          notif.id,
          notif.user_id,
          notif.title,
          notif.message,
          notif.type,
          notif.link,
          notif.is_read
        ]
      );
    }
    console.log(`[Seed] Seeded ${SEED_NOTIFICATIONS.length} notifications.`);

    await dbConn.end();
    console.log('[Seed] Database seeding completed successfully.');
  } catch (err) {
    console.error('[Seed] Database seed error:', err.message);
    throw err;
  }
}

// Allow direct CLI execution: node src/database/seed.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
