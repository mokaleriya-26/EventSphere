import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState('loading'); // 'loading' | 'authenticated' | 'unauthenticated'
  const [sessionError, setSessionError] = useState(null);
  const refreshPromiseRef = useRef(null);

  const refreshSession = async () => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }
    const promise = (async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setAuthStatus('authenticated');
          setSessionError(null);
          return currentUser;
        } else {
          setUser(null);
          setAuthStatus('unauthenticated');
          return null;
        }
      } catch (err) {
        setUser(null);
        setAuthStatus('unauthenticated');
        setSessionError(err?.message || null);
        return null;
      } finally {
        setLoading(false);
        refreshPromiseRef.current = null;
      }
    })();
    refreshPromiseRef.current = promise;
    return promise;
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const login = async (email, password, expectedRole = null) => {
    setLoading(true);
    try {
      const loggedUser = await authService.login(email, password, expectedRole);
      setUser(loggedUser);
      setAuthStatus('authenticated');
      setSessionError(null);
      return loggedUser;
    } catch (err) {
      setSessionError(err?.message || null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setAuthStatus('unauthenticated');
      setSessionError(null);
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const newUser = await authService.register(userData);
      setUser(newUser);
      setAuthStatus('authenticated');
      setSessionError(null);
      return newUser;
    } catch (err) {
      setSessionError(err?.message || null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updates) => {
    if (!user) return;
    setUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authStatus,
        isAuthenticated: authStatus === 'authenticated' && !!user,
        sessionError,
        refreshSession,
        login,
        logout,
        register,
        updateUser,
        isAdmin: user?.role === 'admin',
        isOrganizer: user?.role === 'organizer',
        isAttendee: user?.role === 'attendee'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
