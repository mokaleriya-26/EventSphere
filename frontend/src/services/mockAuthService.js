import { getItem, setItem, STORAGE_KEYS } from './storage';

export const DEMO_PASSWORD = 'EventSpearDemo!2026';
export const LEGACY_DEMO_PASSWORD = 'EventSphere123!';

export const mockAuthService = {
  getCurrentUser: () => {
    return getItem(STORAGE_KEYS.CURRENT_USER, null);
  },

  setCurrentUser: (user) => {
    setItem(STORAGE_KEYS.CURRENT_USER, user);
    return user;
  },

  login: async (email, password) => {
    const users = getItem(STORAGE_KEYS.USERS, []);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error('No account found with this email.');
    }
    if (user.status === 'suspended') {
      throw new Error('This account has been suspended by an administrator.');
    }
    // Accept demo password or any password in demo mode
    if (password && password !== DEMO_PASSWORD && password !== LEGACY_DEMO_PASSWORD && password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    setItem(STORAGE_KEYS.CURRENT_USER, user);
    return user;
  },

  logout: async () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    return true;
  },

  register: async ({ name, email, role, password }) => {
    const users = getItem(STORAGE_KEYS.USERS, []);
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: role || 'attendee',
      organization: role === 'organizer' ? `${name} Productions` : undefined,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      city: 'Mumbai',
      bio: role === 'organizer' ? 'Event organizer on EventSphere.' : 'Event enthusiast and attendee.',
      status: 'active',
      registeredAt: new Date().toISOString()
    };

    const updated = [...users, newUser];
    setItem(STORAGE_KEYS.USERS, updated);
    setItem(STORAGE_KEYS.CURRENT_USER, newUser);
    return newUser;
  },

  switchRole: (role) => {
    const users = getItem(STORAGE_KEYS.USERS, []);
    const user = users.find(u => u.role === role);
    if (user) {
      setItem(STORAGE_KEYS.CURRENT_USER, user);
      return user;
    }
    return null;
  },

  getDemoAccounts: () => {
    const users = getItem(STORAGE_KEYS.USERS, []);
    return {
      attendee: users.find(u => u.role === 'attendee'),
      organizer: users.find(u => u.role === 'organizer'),
      admin: users.find(u => u.role === 'admin')
    };
  }
};
