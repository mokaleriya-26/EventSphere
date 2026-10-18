import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import request from 'supertest';
import app from '../src/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

describe('Database Schema, Migrations & Health Verification', () => {
  it('1. schema.sql exists and defines all required application tables', () => {
    const schemaPath = path.join(projectRoot, 'database/schema.sql');
    expect(fs.existsSync(schemaPath)).toBe(true);

    const content = fs.readFileSync(schemaPath, 'utf8');
    expect(content).toContain('CREATE TABLE IF NOT EXISTS `users`');
    expect(content).toContain('CREATE TABLE IF NOT EXISTS `categories`');
    expect(content).toContain('CREATE TABLE IF NOT EXISTS `events`');
    expect(content).toContain('CREATE TABLE IF NOT EXISTS `registrations`');
    expect(content).toContain('CREATE TABLE IF NOT EXISTS `notifications`');
    expect(content).toContain('CREATE TABLE IF NOT EXISTS `_migrations`');
  });

  it('2. seed.sql exists and provisions 11 users and 25 events', () => {
    const seedPath = path.join(projectRoot, 'database/seed.sql');
    expect(fs.existsSync(seedPath)).toBe(true);

    const content = fs.readFileSync(seedPath, 'utf8');
    // 5 attendees
    expect(content).toContain('attendee1@eventspear.local');
    expect(content).toContain('attendee5@eventspear.local');
    // 5 organizers
    expect(content).toContain('organizer1@eventspear.local');
    expect(content).toContain('organizer5@eventspear.local');
    // 1 admin
    expect(content).toContain('admin@eventspear.local');
    // 25 events (5 per organizer)
    expect(content).toContain('evt-org1-1');
    expect(content).toContain('evt-org1-5');
    expect(content).toContain('evt-org5-5');
    // Password hash for EventSpearLocal!2026
    expect(content).toContain('$2b$10$VISRglqPU8qMOGKnbK0lxe90li59FYnT.vtnIgM0Sgh/RJtfBDaY6');
  });

  it('3. migrations directory exists and has initial schema migration', () => {
    const migrationsDir = path.join(projectRoot, 'database/migrations');
    expect(fs.existsSync(migrationsDir)).toBe(true);
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
    expect(files.length).toBeGreaterThanOrEqual(1);
  });

  it('4. database/README.md documents creation, import, seed, and backup commands', () => {
    const readmePath = path.join(projectRoot, 'database/README.md');
    expect(fs.existsSync(readmePath)).toBe(true);
    const content = fs.readFileSync(readmePath, 'utf8');
    expect(content).toContain('schema.sql');
    expect(content).toContain('seed.sql');
    expect(content).toContain('mysqldump');
    expect(content).toContain('npm run migrate');
    expect(content).toContain('npm run seed');
  });

  it('5. GET /api/health accurately reports service & database readiness', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('UP');
    expect(res.body.database).toBeDefined();
    expect(res.body.database.status).toBe('connected');
  });
});
