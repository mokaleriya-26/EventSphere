import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import { env } from '../src/config/env.js';

// Setup mock DB state for auth lifecycle testing
const mockDb = {
  users: [],
  categories: [],
  events: [],
  registrations: []
};

vi.mock('../src/config/database.js', () => {
  return {
    getPool: vi.fn(),
    checkDatabaseReadiness: vi.fn(async () => ({
      isConnected: true,
      message: 'Database connected and responsive'
    })),
    query: vi.fn(async (sql, params = []) => {
      const lower = sql.toLowerCase().trim();

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
      if (lower.includes('from categories')) {
        return mockDb.categories;
      }

      // EVENTS
      if (lower.includes('from events where id =')) {
        const id = params[0];
        return mockDb.events.filter(e => e.id === id);
      }
      if (lower.includes('from events') && lower.includes('count(*)')) {
        return [{ total: mockDb.events.length }];
      }
      if (lower.includes('from events')) {
        return mockDb.events;
      }

      // REGISTRATIONS
      if (lower.includes('from registrations')) {
        return mockDb.registrations;
      }

      return [];
    }),
    withTransaction: vi.fn(async (cb) => cb({
      execute: vi.fn(),
      query: vi.fn()
    }))
  };
});

describe('Authentication Lifecycle, Role-Based Route Protection & Session Tests', () => {
  const commonPassword = 'EventSpearLocal!2026';
  let passwordHash;
  let attendeeUser;
  let organizerUser;
  let adminUser;

  beforeEach(async () => {
    passwordHash = await bcrypt.hash(commonPassword, 10);

    attendeeUser = {
      id: 'usr-att-1',
      name: 'Aarav Sharma',
      email: 'attendee1@eventspear.local',
      password_hash: passwordHash,
      role: 'attendee',
      organization: null,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      city: 'Mumbai, MH',
      bio: 'Software engineer keen on tech conferences',
      account_status: 'active'
    };

    organizerUser = {
      id: 'usr-org-1',
      name: 'TechNova Productions',
      email: 'organizer1@eventspear.local',
      password_hash: passwordHash,
      role: 'organizer',
      organization: 'TechNova Global Pvt Ltd',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
      city: 'Bengaluru, KA',
      bio: 'Pioneer of high-impact developer summits',
      account_status: 'active'
    };

    adminUser = {
      id: 'usr-admin-1',
      name: 'EventSpear Platform Admin',
      email: 'admin@eventspear.local',
      password_hash: passwordHash,
      role: 'admin',
      organization: 'EventSpear Operations',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
      city: 'Mumbai, MH',
      bio: 'Platform administration and safety',
      account_status: 'active'
    };

    mockDb.users = [attendeeUser, organizerUser, adminUser];
    mockDb.categories = [
      { id: 'cat-tech', name: 'Technology', slug: 'tech', is_active: 1 }
    ];
    mockDb.events = [
      {
        id: 'evt-101',
        organizer_id: 'usr-org-1',
        category_id: 'cat-tech',
        title: 'Tech Summit 2026',
        slug: 'tech-summit-2026',
        status: 'published',
        capacity: 100,
        price: 0.00
      }
    ];
    mockDb.registrations = [];
  });

  // 1. Unauthenticated Visitor Access
  it('1. Unauthenticated visitor cannot access protected attendee endpoint (/api/registrations/me)', async () => {
    const res = await request(app).get('/api/registrations/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/Authentication required/i);
  });

  it('2. Unauthenticated visitor cannot access protected organizer endpoint (/api/organizer/events)', async () => {
    const res = await request(app).get('/api/organizer/events');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('3. Unauthenticated visitor cannot access protected admin endpoint (/api/admin/dashboard)', async () => {
    const res = await request(app).get('/api/admin/dashboard');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // 2. Authenticated Session Restoration & Role Resolution
  it('4. Authenticated attendee session restores profile with role attendee', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: attendeeUser.email, password: commonPassword });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.user.role).toBe('attendee');

    const cookie = loginRes.headers['set-cookie'];
    expect(cookie).toBeDefined();

    // Verify session restoration on /api/auth/me
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookie);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.user.email).toBe(attendeeUser.email);
    expect(meRes.body.user.role).toBe('attendee');
  });

  it('5. Authenticated organizer session restores profile with role organizer', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: organizerUser.email, password: commonPassword });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.user.role).toBe('organizer');

    const cookie = loginRes.headers['set-cookie'];

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookie);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.role).toBe('organizer');
  });

  it('6. Authenticated admin session restores profile with role admin', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: adminUser.email, password: commonPassword });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.user.role).toBe('admin');

    const cookie = loginRes.headers['set-cookie'];

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookie);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.role).toBe('admin');
  });

  // 3. Role-Based Route Authorization Enforcements
  it('7. Attendees cannot access admin-only endpoints (HTTP 403)', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: attendeeUser.email, password: commonPassword });
    const cookie = loginRes.headers['set-cookie'];

    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Cookie', cookie);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/Access forbidden/i);
  });

  it('8. Organizers cannot access admin-only endpoints (HTTP 403)', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: organizerUser.email, password: commonPassword });
    const cookie = loginRes.headers['set-cookie'];

    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Cookie', cookie);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('9. Administrators can access admin endpoints (HTTP 200)', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: adminUser.email, password: commonPassword });
    const cookie = loginRes.headers['set-cookie'];

    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // 4. Logout Flow & Invalidation
  it('10. POST /api/auth/logout clears auth cookie and subsequent requests are rejected with 401', async () => {
    // 1. Log in
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: attendeeUser.email, password: commonPassword });
    const initialCookie = loginRes.headers['set-cookie'];

    // 2. Perform Logout
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', initialCookie);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);
    expect(logoutRes.body.message).toMatch(/Logged out successfully/i);

    // Verify Set-Cookie header clears the cookie
    const clearCookieHeader = logoutRes.headers['set-cookie'];
    expect(clearCookieHeader).toBeDefined();
    expect(clearCookieHeader.some(c => c.includes(`${env.COOKIE_NAME}=;`) || c.includes('Expires=Thu, 01 Jan 1970'))).toBe(true);

    // 3. Subsequent request without cookie produces 401
    const postLogoutRes = await request(app).get('/api/auth/me');
    expect(postLogoutRes.status).toBe(401);
  });

  // 5. Expired Session Handling
  it('11. Expired JWT token produces HTTP 401 with session expired message', async () => {
    // Create an expired token manually
    const expiredToken = jwt.sign(
      { id: attendeeUser.id, email: attendeeUser.email, role: attendeeUser.role },
      env.JWT_SECRET,
      { expiresIn: '-1s' } // Expired 1 second ago
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/Session expired/i);
  });

  // 6. Suspended Account Handling
  it('12. Suspended user accounts are rejected with 403 on protected routes', async () => {
    // Suspend user in mock db
    attendeeUser.account_status = 'suspended';

    const token = jwt.sign(
      { id: attendeeUser.id, email: attendeeUser.email, role: attendeeUser.role },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/account has been suspended/i);
  });
});
