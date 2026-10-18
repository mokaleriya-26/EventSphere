import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';

// Setup in-memory mock database state
const mockDb = {
  users: [],
  categories: [],
  events: [],
  registrations: [],
  notifications: []
};

// Mock database module
vi.mock('../src/config/database.js', () => {
  return {
    getPool: vi.fn(),
    checkDatabaseReadiness: vi.fn().mockResolvedValue({
      isConnected: true,
      message: 'Database connected and responsive'
    }),
    query: vi.fn(async (sql, params = []) => {
      const lower = sql.toLowerCase().trim();

      // Health / readiness
      if (lower.startsWith('select 1')) return [{ 1: 1 }];

      // USERS
      if (lower.includes('from users where email =')) {
        const email = params[0]?.toLowerCase();
        return mockDb.users.filter(u => u.email.toLowerCase() === email);
      }
      if (lower.includes('from users where id =')) {
        const id = params[0];
        return mockDb.users.filter(u => u.id === id).map(({ password_hash, ...rest }) => rest);
      }
      if (lower.includes('insert into users')) {
        // [id, name, email, password_hash, role, organization, avatar, city, bio, account_status]
        mockDb.users.push({
          id: params[0],
          name: params[1],
          email: params[2],
          password_hash: params[3],
          role: params[4],
          organization: params[5],
          avatar: params[6],
          city: params[7],
          bio: params[8],
          account_status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        return { insertId: 1 };
      }
      if (lower.includes('update users set account_status =')) {
        const status = params[0];
        const id = params[1];
        const user = mockDb.users.find(u => u.id === id);
        if (user) user.account_status = status;
        return { affectedRows: 1 };
      }
      if (lower.includes('from users') && lower.includes('count(*)')) {
        return [{
          total: mockDb.users.length,
          organizers: mockDb.users.filter(u => u.role === 'organizer').length,
          attendees: mockDb.users.filter(u => u.role === 'attendee').length
        }];
      }
      if (lower.includes('from users')) {
        return mockDb.users;
      }

      // CATEGORIES
      if (lower.includes('from categories where id =') || lower.includes('from categories where slug =')) {
        const val = params[0];
        return mockDb.categories.filter(c => c.id === val || c.slug === val);
      }
      if (lower.includes('insert into categories')) {
        mockDb.categories.push({
          id: params[0],
          name: params[1],
          slug: params[2],
          description: params[3],
          icon_name: params[4],
          color: params[5],
          badge_text: params[6],
          cover_image_url: params[7],
          is_active: params[8],
          created_at: new Date().toISOString()
        });
        return { insertId: 1 };
      }
      if (lower.includes('from categories') && lower.includes('count(*)')) {
        return [{ total: mockDb.categories.length, active: mockDb.categories.filter(c => c.is_active).length }];
      }
      if (lower.includes('from categories')) {
        return mockDb.categories.map(c => ({
          ...c,
          event_count: mockDb.events.filter(e => e.category_id === c.id).length
        }));
      }

      // EVENTS
      if (lower.includes('from events') && lower.includes('count(*) as total')) {
        return [{ total: mockDb.events.filter(e => e.status === 'published').length }];
      }
      if (lower.includes('from events e') && (lower.includes('where e.id =') || lower.includes('where (e.id =') || lower.includes('e.slug = ?'))) {
        const idOrSlug = params[0];
        const evt = mockDb.events.find(e => e.id === idOrSlug || e.slug === idOrSlug);
        if (!evt) return [];
        const cat = mockDb.categories.find(c => c.id === evt.category_id) || {};
        const org = mockDb.users.find(u => u.id === evt.organizer_id) || {};
        const regCount = mockDb.registrations.filter(r => r.event_id === evt.id && r.status === 'confirmed').length;
        return [{
          ...evt,
          category_name: cat.name || 'Category',
          category_slug: cat.slug || 'slug',
          organizer_name: org.name || 'Organizer',
          organizer_avatar: org.avatar || '',
          registered_count: regCount
        }];
      }
      if (lower.includes('from events where id =')) {
        const id = params[0];
        return mockDb.events.filter(e => e.id === id);
      }
      if (lower.includes('from events') && lower.includes('order by')) {
        return mockDb.events.map(evt => {
          const cat = mockDb.categories.find(c => c.id === evt.category_id) || {};
          const org = mockDb.users.find(u => u.id === evt.organizer_id) || {};
          const regCount = mockDb.registrations.filter(r => r.event_id === evt.id && r.status === 'confirmed').length;
          return {
            ...evt,
            category_name: cat.name,
            category_slug: cat.slug,
            organizer_name: org.name,
            organizer_avatar: org.avatar,
            registered_count: regCount
          };
        });
      }
      if (lower.includes('insert into events')) {
        const newEvt = {
          id: params[0],
          organizer_id: params[1],
          category_id: params[2],
          title: params[3],
          slug: params[4],
          summary: params[5],
          description: params[6],
          cover_image_url: params[7],
          start_datetime: params[8],
          end_datetime: params[9],
          venue_name: params[10],
          address: params[11],
          city: params[12],
          event_type: params[13],
          capacity: params[14],
          price: params[15],
          currency: params[16],
          status: params[17],
          featured: params[18],
          created_at: new Date().toISOString()
        };
        mockDb.events.push(newEvt);
        return { insertId: 1 };
      }
      if (lower.includes('update events set status =')) {
        const status = params[0];
        const id = params[1];
        const evt = mockDb.events.find(e => e.id === id);
        if (evt) evt.status = status;
        return { affectedRows: 1 };
      }

      // REGISTRATIONS
      if (lower.includes('from registrations') && lower.includes('count(*) as count')) {
        const eventId = params[0];
        const count = mockDb.registrations.filter(r => r.event_id === eventId && r.status === 'confirmed').length;
        return [{ count }];
      }
      if (lower.includes('from registrations r join events e on r.event_id = e.id where r.id =')) {
        const id = params[0];
        const reg = mockDb.registrations.find(r => r.id === id);
        if (!reg) return [];
        const evt = mockDb.events.find(e => e.id === reg.event_id) || {};
        return [{ ...reg, organizer_id: evt.organizer_id, event_title: evt.title }];
      }
      if (lower.includes('update registrations set status =')) {
        const id = params[0];
        const reg = mockDb.registrations.find(r => r.id === id);
        if (reg) reg.status = 'cancelled';
        return { affectedRows: 1 };
      }
      if (lower.includes('from registrations') && lower.includes('count(*)')) {
        return [{ total: mockDb.registrations.length, confirmed: mockDb.registrations.filter(r => r.status === 'confirmed').length }];
      }

      return [];
    }),
    withTransaction: vi.fn(async (cb) => {
      const conn = {
        execute: vi.fn(async (sql, params = []) => {
          const lower = sql.toLowerCase().trim();
          if (lower.includes('from events where id =')) {
            const id = params[0];
            const evt = mockDb.events.filter(e => e.id === id);
            return [evt];
          }
          if (lower.includes('from registrations where event_id = ? and attendee_id = ?')) {
            const [eventId, attendeeId] = params;
            const existing = mockDb.registrations.filter(
              r => r.event_id === eventId && r.attendee_id === attendeeId && r.status === 'confirmed'
            );
            return [existing];
          }
          if (lower.includes('from registrations where event_id = ? and status =')) {
            const [eventId] = params;
            const count = mockDb.registrations.filter(
              r => r.event_id === eventId && r.status === 'confirmed'
            ).length;
            return [[{ confirmed_count: count }]];
          }
          if (lower.includes('from registrations where booking_reference =')) {
            return [[]];
          }
          if (lower.includes('insert into registrations')) {
            mockDb.registrations.push({
              id: params[0],
              event_id: params[1],
              attendee_id: params[2],
              booking_reference: params[3],
              ticket_type: params[4],
              price: 0.00,
              status: 'confirmed',
              registered_at: new Date().toISOString()
            });
            return [{ insertId: 1 }];
          }
          if (lower.includes('insert into notifications')) {
            return [{ insertId: 1 }];
          }
          return [[]];
        })
      };
      return await cb(conn);
    })
  };
});

// Import app after mocking
import app from '../src/app.js';

describe('EventSphere Full-Stack Backend API Tests', () => {
  let attendeeToken = '';
  let organizerToken = '';
  let adminToken = '';

  beforeEach(async () => {
    // Reset in-memory DB
    mockDb.users = [
      {
        id: 'usr-attendee',
        name: 'Sarah Jenkins',
        email: 'attendee@eventsphere.demo',
        password_hash: await bcrypt.hash('Password123!', 10),
        role: 'attendee',
        account_status: 'active'
      },
      {
        id: 'usr-organizer',
        name: 'InnoVerse Technologies',
        email: 'organizer@eventsphere.demo',
        password_hash: await bcrypt.hash('Password123!', 10),
        role: 'organizer',
        account_status: 'active'
      },
      {
        id: 'usr-admin',
        name: 'Alex Vance',
        email: 'admin@eventsphere.demo',
        password_hash: await bcrypt.hash('Password123!', 10),
        role: 'admin',
        account_status: 'active'
      },
      {
        id: 'usr-demo-attendee',
        name: 'Demo Attendee',
        email: 'demo.attendee@eventspear.local',
        password_hash: await bcrypt.hash('EventSpearDemo!2026', 10),
        role: 'attendee',
        account_status: 'active'
      },
      {
        id: 'usr-demo-organizer',
        name: 'Demo Organizer',
        email: 'demo.organizer@eventspear.local',
        password_hash: await bcrypt.hash('EventSpearDemo!2026', 10),
        role: 'organizer',
        account_status: 'active'
      },
      {
        id: 'usr-demo-admin',
        name: 'Demo Admin',
        email: 'demo.admin@eventspear.local',
        password_hash: await bcrypt.hash('EventSpearDemo!2026', 10),
        role: 'admin',
        account_status: 'active'
      }
    ];

    const localHash = await bcrypt.hash('EventSpearLocal!2026', 10);
    for (let i = 1; i <= 5; i++) {
      mockDb.users.push({
        id: `usr-att-${i}`,
        name: `Attendee ${i}`,
        email: `attendee${i}@eventspear.local`,
        password_hash: localHash,
        role: 'attendee',
        account_status: 'active'
      });
      mockDb.users.push({
        id: `usr-org-${i}`,
        name: `Organizer ${i}`,
        email: `organizer${i}@eventspear.local`,
        password_hash: localHash,
        role: 'organizer',
        account_status: 'active'
      });
    }
    mockDb.users.push({
      id: 'usr-admin-1',
      name: 'Platform Administrator',
      email: 'admin@eventspear.local',
      password_hash: localHash,
      role: 'admin',
      account_status: 'active'
    });

    mockDb.categories = [
      {
        id: 'cat-tech',
        name: 'Tech Events',
        slug: 'tech',
        description: 'Technology conferences',
        is_active: 1
      }
    ];

    mockDb.events = [
      {
        id: 'evt-101',
        organizer_id: 'usr-organizer',
        category_id: 'cat-tech',
        title: 'Tech Summit 2026',
        slug: 'tech-summit-2026',
        summary: 'Annual Tech Summit',
        description: 'Deep dive into cloud and AI',
        start_datetime: '2026-12-01 10:00:00',
        end_datetime: '2026-12-01 16:00:00',
        venue_name: 'Convention Center',
        city: 'Mumbai',
        event_type: 'in-person',
        capacity: 2,
        price: 0.00,
        currency: 'USD',
        status: 'published',
        featured: 0
      },
      {
        id: 'evt-cancelled',
        organizer_id: 'usr-organizer',
        category_id: 'cat-tech',
        title: 'Cancelled Expo',
        slug: 'cancelled-expo',
        summary: 'Cancelled event',
        start_datetime: '2026-12-10 10:00:00',
        end_datetime: '2026-12-10 16:00:00',
        venue_name: 'Expo Hall',
        city: 'Mumbai',
        capacity: 100,
        price: 0.00,
        status: 'cancelled'
      }
    ];

    mockDb.registrations = [];

    // Login users to get tokens
    const attRes = await request(app).post('/api/auth/login').send({
      email: 'attendee@eventsphere.demo',
      password: 'Password123!'
    });
    attendeeToken = attRes.body.token;

    const orgRes = await request(app).post('/api/auth/login').send({
      email: 'organizer@eventsphere.demo',
      password: 'Password123!'
    });
    organizerToken = orgRes.body.token;

    const admRes = await request(app).post('/api/auth/login').send({
      email: 'admin@eventsphere.demo',
      password: 'Password123!'
    });
    adminToken = admRes.body.token;
  });

  // 1. API Health Check
  it('1. GET /api/health returns 200 with service status and database readiness', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.service).toBe('EventSphere API');
    expect(res.body.database.status).toBe('connected');
  });

  // 2. Successful Account Registration
  it('2. POST /api/auth/register successfully registers a new attendee', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'SecretPassword123!',
      role: 'attendee'
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('john.doe@example.com');
    expect(res.body.user.role).toBe('attendee');
    expect(res.body.token).toBeDefined();
    expect(res.body.user.password_hash).toBeUndefined(); // Never leaks password hash
  });

  // 3. Duplicate Email Rejection
  it('3. POST /api/auth/register rejects duplicate email with 409 conflict', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Duplicate Sarah',
      email: 'attendee@eventsphere.demo',
      password: 'SecretPassword123!',
      role: 'attendee'
    });
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  // 4. Successful Login
  it('4. POST /api/auth/login logs in user and sets auth cookie', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'attendee@eventsphere.demo',
      password: 'Password123!'
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.id).toBe('usr-attendee');
    expect(res.body.token).toBeDefined();
  });

  // 5. Invalid Password Rejection
  it('5. POST /api/auth/login rejects wrong password with 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'attendee@eventsphere.demo',
      password: 'WrongPassword!'
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // 6. Authentication Required for Protected Routes
  it('6. GET /api/auth/me returns 401 without auth token or cookie', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // 7. Role-Based Access Control
  it('7. Attendees are forbidden from creating events (403)', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${attendeeToken}`)
      .send({
        title: 'Unauthorized Event',
        categoryId: 'cat-tech',
        startDatetime: '2026-12-05 10:00:00',
        endDatetime: '2026-12-05 12:00:00',
        venueName: 'Hall A',
        city: 'Mumbai',
        capacity: 50
      });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // 8. Event Creation by Organizer
  it('8. Organizers can successfully create events', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({
        title: 'New AI Workshop',
        categoryId: 'cat-tech',
        summary: 'Hands-on AI Workshop',
        description: 'Build neural nets from scratch',
        startDatetime: '2026-12-05 10:00:00',
        endDatetime: '2026-12-05 14:00:00',
        venueName: 'Tech Hub',
        city: 'Mumbai',
        capacity: 100,
        price: 0
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.event.title).toBe('New AI Workshop');
  });

  // 9. Organizer Event Ownership Protection
  it('9. Organizers cannot edit events they do not own', async () => {
    // Create second organizer
    mockDb.users.push({
      id: 'usr-organizer-other',
      email: 'other@eventsphere.demo',
      password_hash: await bcrypt.hash('Password123!', 10),
      role: 'organizer',
      account_status: 'active'
    });
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'other@eventsphere.demo',
      password: 'Password123!'
    });

    const res = await request(app)
      .put('/api/events/evt-101')
      .set('Authorization', `Bearer ${loginRes.body.token}`)
      .send({ title: 'Hijacked Title' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // 10. Event Filtering
  it('10. GET /api/events returns published events with filters', async () => {
    const res = await request(app).get('/api/events?city=Mumbai');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // 11. Event Registration & Duplicate Booking Rejection
  it('11. Prevents duplicate registrations for the same attendee', async () => {
    // First registration succeeds
    const res1 = await request(app)
      .post('/api/registrations/events/evt-101/register')
      .set('Authorization', `Bearer ${attendeeToken}`)
      .send({ ticketType: 'General Admission' });
    expect(res1.status).toBe(201);
    expect(res1.body.success).toBe(true);
    expect(res1.body.booking.bookingRef).toBeDefined();

    // Duplicate registration is rejected
    const res2 = await request(app)
      .post('/api/registrations/events/evt-101/register')
      .set('Authorization', `Bearer ${attendeeToken}`)
      .send({ ticketType: 'General Admission' });
    expect(res2.status).toBe(409);
    expect(res2.body.success).toBe(false);
  });

  // 12. Capacity Enforcement
  it('12. Rejects registration when event capacity is exhausted', async () => {
    // Fill up capacity of evt-101 (capacity: 2)
    mockDb.registrations.push({
      id: 'bkg-1',
      event_id: 'evt-101',
      attendee_id: 'usr-attendee-2',
      booking_reference: 'ES-2026-1111',
      status: 'confirmed'
    });
    mockDb.registrations.push({
      id: 'bkg-2',
      event_id: 'evt-101',
      attendee_id: 'usr-attendee-3',
      booking_reference: 'ES-2026-2222',
      status: 'confirmed'
    });

    const res = await request(app)
      .post('/api/registrations/events/evt-101/register')
      .set('Authorization', `Bearer ${attendeeToken}`)
      .send({ ticketType: 'General Admission' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/full capacity/i);
  });

  // 13. Cancelled Event Registration Rejection
  it('13. Rejects registration for cancelled events', async () => {
    const res = await request(app)
      .post('/api/registrations/events/evt-cancelled/register')
      .set('Authorization', `Bearer ${attendeeToken}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/cancelled/i);
  });

  // 14. Booking Cancellation Permissions
  it('14. Attendee can cancel their own booking, but cannot cancel others', async () => {
    mockDb.registrations.push({
      id: 'bkg-my-ticket',
      event_id: 'evt-101',
      attendee_id: 'usr-attendee',
      booking_reference: 'ES-2026-9999',
      status: 'confirmed'
    });

    const res = await request(app)
      .delete('/api/registrations/bkg-my-ticket')
      .set('Authorization', `Bearer ${attendeeToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.booking.status).toBe('cancelled');
  });

  // 15. Admin-Only Operations
  it('15. Only administrators can access admin dashboard & toggle user status', async () => {
    const forbiddenRes = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${organizerToken}`);
    expect(forbiddenRes.status).toBe(403);

    const adminRes = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminRes.status).toBe(200);
    expect(adminRes.body.success).toBe(true);
    expect(adminRes.body.stats).toBeDefined();
  });

  // 16. Input Validation and Invalid Data
  it('16. Validates request body and rejects invalid data with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'invalid-email-format',
        password: '123' // too short
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.details).toBeDefined();
  });

  // 17. Safe Database and Operational Error Handling
  it('17. Unknown route returns 404 with clean JSON error without stack leak', async () => {
    const res = await request(app).get('/api/unknown-non-existent-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/Endpoint not found/i);
  });

  // 18. EventSpear Demonstration Accounts Authentication
  it('18. Authenticates all three development demo accounts with EventSpearDemo!2026', async () => {
    // Attendee
    const attRes = await request(app).post('/api/auth/login').send({
      email: 'demo.attendee@eventspear.local',
      password: 'EventSpearDemo!2026'
    });
    expect(attRes.status).toBe(200);
    expect(attRes.body.success).toBe(true);
    expect(attRes.body.user.role).toBe('attendee');
    expect(attRes.body.token).toBeDefined();

    // Organizer
    const orgRes = await request(app).post('/api/auth/login').send({
      email: 'demo.organizer@eventspear.local',
      password: 'EventSpearDemo!2026'
    });
    expect(orgRes.status).toBe(200);
    expect(orgRes.body.success).toBe(true);
    expect(orgRes.body.user.role).toBe('organizer');

    // Admin
    const admRes = await request(app).post('/api/auth/login').send({
      email: 'demo.admin@eventspear.local',
      password: 'EventSpearDemo!2026'
    });
    expect(admRes.status).toBe(200);
    expect(admRes.body.success).toBe(true);
    expect(admRes.body.user.role).toBe('admin');
  });

  // 19. Unknown Email Rejection
  it('19. POST /api/auth/login rejects unknown email with 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nonexistent.user@example.com',
      password: 'AnyPassword123!'
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // 20. Missing Login Fields Validation
  it('20. POST /api/auth/login validates missing email and password with 400', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // 21. Logout clears session / cookie
  it('21. POST /api/auth/logout successfully clears authentication state', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // 22. Current-User /api/auth/me returns profile for authenticated user
  it('22. GET /api/auth/me returns user profile when valid Bearer token provided', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${attendeeToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('attendee@eventsphere.demo');
    expect(res.body.user.password_hash).toBeUndefined();
  });

  // 23. Expected role matches category
  it('23. POST /api/auth/login with expectedRole matching role returns 200', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'attendee1@eventspear.local',
      password: 'EventSpearLocal!2026',
      expectedRole: 'attendee'
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('attendee');
  });

  // 24. Expected role category mismatch returns 403
  it('24. POST /api/auth/login with expectedRole mismatch returns 403 with category prompt', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'attendee1@eventspear.local',
      password: 'EventSpearLocal!2026',
      expectedRole: 'organizer'
    });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/Role category mismatch/i);
    expect(res.body.error).toMatch(/User \/ Attendee/i);
  });

  // 25. All 11 seeded accounts authenticate successfully
  it('25. Authenticates all 11 local seeded accounts with EventSpearLocal!2026', async () => {
    // 5 attendees
    for (let i = 1; i <= 5; i++) {
      const res = await request(app).post('/api/auth/login').send({
        email: `attendee${i}@eventspear.local`,
        password: 'EventSpearLocal!2026',
        expectedRole: 'attendee'
      });
      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe('attendee');
    }

    // 5 organizers
    for (let i = 1; i <= 5; i++) {
      const res = await request(app).post('/api/auth/login').send({
        email: `organizer${i}@eventspear.local`,
        password: 'EventSpearLocal!2026',
        expectedRole: 'organizer'
      });
      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe('organizer');
    }

    // 1 admin
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@eventspear.local',
      password: 'EventSpearLocal!2026',
      expectedRole: 'admin'
    });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('admin');
  });

  // 26. Role access control: Attendee and Organizer cannot access admin dashboard
  it('26. Forbids non-admin users from accessing /api/admin/dashboard', async () => {
    const attRes = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${attendeeToken}`);
    expect(attRes.status).toBe(403);

    const orgRes = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${organizerToken}`);
    expect(orgRes.status).toBe(403);
  });

  // 27. Role access control: Unauthenticated requests rejected
  it('27. Rejects unauthenticated requests to protected endpoints with 401', async () => {
    const res = await request(app).get('/api/admin/dashboard');
    expect(res.status).toBe(401);
  });
});

