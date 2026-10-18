import { seedEvents } from '../data/seedEvents';
import { seedCategories } from '../data/seedCategories';
import { seedUsers } from '../data/seedUsers';
import { seedBookings } from '../data/seedBookings';
import { seedNotifications } from '../data/seedNotifications';

const STORAGE_KEYS = {
  EVENTS: 'eventsphere_events',
  CATEGORIES: 'eventsphere_categories',
  USERS: 'eventsphere_users',
  BOOKINGS: 'eventsphere_bookings',
  NOTIFICATIONS: 'eventsphere_notifications',
  CURRENT_USER: 'eventsphere_auth_user'
};

export const initStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(seedEvents));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(seedCategories));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(seedUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(seedBookings));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(seedNotifications));
  }
};

export const resetAllDemoData = () => {
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(seedEvents));
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(seedCategories));
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(seedUsers));
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(seedBookings));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(seedNotifications));
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

export const getItem = (key, fallback = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
};

export const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
};

export { STORAGE_KEYS };
