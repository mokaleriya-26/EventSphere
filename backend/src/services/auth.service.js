import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export const createToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

export const sanitizeUser = (user) => {
  if (!user) return null;
  const { password_hash, ...sanitized } = user;
  return sanitized;
};

export const registerUser = async ({ name, email, password, role = 'attendee', organization, avatar, city, bio }) => {
  // Disallow registering as admin publicly
  if (role === 'admin') {
    throw new AppError('Public registration for the administrator role is forbidden.', 403);
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check unique email
  const existing = await query('SELECT id FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);
  if (existing.length > 0) {
    throw new AppError('An account with this email address already exists.', 409);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  const userId = `usr-${Date.now()}`;
  const defaultAvatar = avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
  const orgName = role === 'organizer' ? (organization || `${name} Productions`) : null;
  const userBio = bio || (role === 'organizer' ? 'Event organizer on EventSphere.' : 'Event enthusiast and attendee.');

  await query(
    `INSERT INTO users (id, name, email, password_hash, role, organization, avatar, city, bio, account_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
    [userId, name, normalizedEmail, passwordHash, role, orgName, defaultAvatar, city || 'Mumbai', userBio]
  );

  const newUserRows = await query('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
  const user = sanitizeUser(newUserRows[0]);
  const token = createToken(user);

  return { user, token };
};

export const loginUser = async (email, password, expectedRole = null) => {
  const normalizedEmail = email.toLowerCase().trim();

  const rows = await query('SELECT * FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);
  if (rows.length === 0) {
    throw new AppError('Invalid email or password.', 401);
  }

  const userRecord = rows[0];

  if (userRecord.account_status === 'suspended') {
    throw new AppError('This account has been suspended by an administrator.', 403);
  }

  const isPasswordValid = await bcrypt.compare(password, userRecord.password_hash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (expectedRole && userRecord.role !== expectedRole) {
    const roleLabels = {
      attendee: 'User / Attendee',
      organizer: 'Organizer',
      admin: 'Administrator'
    };
    const actualLabel = roleLabels[userRecord.role] || userRecord.role;
    throw new AppError(
      `Role category mismatch: This account is registered as ${actualLabel}. Please select the ${actualLabel} category above to sign in.`,
      403
    );
  }

  const user = sanitizeUser(userRecord);
  const token = createToken(user);

  return { user, token };
};

export const getUserById = async (userId) => {
  const rows = await query('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
  if (rows.length === 0) return null;
  return sanitizeUser(rows[0]);
};

export const getDemoAccounts = async () => {
  const rows = await query(
    `SELECT id, name, email, role, organization, avatar, city, bio, account_status
     FROM users
     WHERE email IN (
       'attendee1@eventspear.local', 'organizer1@eventspear.local', 'admin@eventspear.local',
       'attendee@eventsphere.demo', 'organizer@eventsphere.demo', 'admin@eventsphere.demo'
     )`
  );

  return {
    attendee: rows.find(r => r.role === 'attendee') || null,
    organizer: rows.find(r => r.role === 'organizer') || null,
    admin: rows.find(r => r.role === 'admin') || null
  };
};
