import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('careercoach_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem('careercoach_access_token') || null;
  });

  const [refreshToken, setRefreshToken] = useState(() => {
    return localStorage.getItem('careercoach_refresh_token') || null;
  });

  const [loading, setLoading] = useState(true);

  // Sync token state to local storage
  useEffect(() => {
    if (user) {
      localStorage.setItem('careercoach_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('careercoach_user');
    }
  }, [user]);

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem('careercoach_access_token', accessToken);
    } else {
      localStorage.removeItem('careercoach_access_token');
    }
  }, [accessToken]);

  useEffect(() => {
    if (refreshToken) {
      localStorage.setItem('careercoach_refresh_token', refreshToken);
    } else {
      localStorage.removeItem('careercoach_refresh_token');
    }
    setLoading(false);
  }, [refreshToken]);

  // Login handler
  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    setUser(data.user);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    return data;
  };

  // Register handler
  const register = async (name, email, password, role = 'user') => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    setUser(data.user);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    return data;
  };

  // Logout handler
  const logout = useCallback(async () => {
    try {
      if (refreshToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
          },
          body: JSON.stringify({ refreshToken })
        });
      }
    } catch (e) {
      console.warn('Logout notification to server failed:', e.message);
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      localStorage.removeItem('careercoach_user');
      localStorage.removeItem('careercoach_access_token');
      localStorage.removeItem('careercoach_refresh_token');
    }
  }, [accessToken, refreshToken]);

  // Function to refresh the access token
  const refreshAccessToken = useCallback(async () => {
    const storedRefreshToken = refreshToken || localStorage.getItem('careercoach_refresh_token');
    if (!storedRefreshToken) {
      throw new Error('No refresh token available');
    }

    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: storedRefreshToken })
    });

    const data = await res.json();
    if (!res.ok) {
      logout();
      throw new Error(data.message || 'Failed to refresh token');
    }

    setAccessToken(data.accessToken);
    localStorage.setItem('careercoach_access_token', data.accessToken);
    return data.accessToken;
  }, [refreshToken, logout]);

  // Authenticated fetch wrapper with automatic token refresh
  const authFetch = useCallback(
    async (url, options = {}) => {
      const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      };

      let currentToken = accessToken || localStorage.getItem('careercoach_access_token');
      if (currentToken) {
        headers['Authorization'] = `Bearer ${currentToken}`;
      }

      let response = await fetch(url, { ...options, headers });

      // If token expired, attempt one refresh
      if (response.status === 401 && (refreshToken || localStorage.getItem('careercoach_refresh_token'))) {
        try {
          const newToken = await refreshAccessToken();
          headers['Authorization'] = `Bearer ${newToken}`;
          response = await fetch(url, { ...options, headers });
        } catch (refreshErr) {
          logout();
          throw refreshErr;
        }
      }

      return response;
    },
    [accessToken, refreshToken, refreshAccessToken, logout]
  );

  const value = {
    user,
    accessToken,
    refreshToken,
    loading,
    isAuthenticated: !!user && !!accessToken,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    authFetch,
    refreshAccessToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
