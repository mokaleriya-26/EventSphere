import { getItem, setItem, STORAGE_KEYS } from './storage';
import { apiClient } from './apiClient';

export const userService = {
  syncUsersFromBackend: async () => {
    try {
      const res = await apiClient.get('/admin/users');
      if (res?.users && Array.isArray(res.users)) {
        setItem(STORAGE_KEYS.USERS, res.users);
        return res.users;
      }
    } catch {
      // Return cached users on temporary error
    }
    return getItem(STORAGE_KEYS.USERS, []);
  },

  getAllUsers: () => {
    return getItem(STORAGE_KEYS.USERS, []);
  },

  toggleUserStatus: async (userId, currentAdminId) => {
    if (userId === currentAdminId) {
      throw new Error('Action prevented: You cannot suspend your own active administrator account.');
    }

    const res = await apiClient.patch(`/admin/users/${userId}/status`);
    if (res?.user) {
      const users = getItem(STORAGE_KEYS.USERS, []);
      const idx = users.findIndex(u => u.id === userId);
      if (idx !== -1) users[idx] = res.user;
      setItem(STORAGE_KEYS.USERS, [...users]);
      return res.user;
    }
    throw new Error('Failed to update user status on server.');
  },

  updateUserProfile: async (userId, updates) => {
    const res = await apiClient.put('/users/profile', updates);
    if (res?.user) {
      const users = getItem(STORAGE_KEYS.USERS, []);
      const idx = users.findIndex(u => u.id === userId);
      if (idx !== -1) users[idx] = res.user;
      setItem(STORAGE_KEYS.USERS, [...users]);

      const currentUser = getItem(STORAGE_KEYS.CURRENT_USER, null);
      if (currentUser && currentUser.id === userId) {
        setItem(STORAGE_KEYS.CURRENT_USER, res.user);
      }
      return res.user;
    }
    throw new Error('Failed to update profile on server.');
  }
};
