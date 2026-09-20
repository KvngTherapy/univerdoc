import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getMe } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('univerdoc_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('univerdoc_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('univerdoc_token');
      if (storedToken) {
        try {
          const res = await getMe();
          setUser(res.data);
          localStorage.setItem('univerdoc_user', JSON.stringify(res.data));
        } catch {
          // Token is invalid/expired
          localStorage.removeItem('univerdoc_token');
          localStorage.removeItem('univerdoc_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const loginUser = async (username, password) => {
    const res = await apiLogin({ username, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('univerdoc_token', receivedToken);
    localStorage.setItem('univerdoc_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const registerUser = async (userData) => {
    const res = await apiRegister(userData);
    return res.data;
  };

  const logoutUser = async () => {
    try {
      await apiLogout();
    } catch (e) {
      console.warn('Logout request completed with warning:', e);
    } finally {
      localStorage.removeItem('univerdoc_token');
      localStorage.removeItem('univerdoc_user');
      setUser(null);
      setToken(null);
      window.location.href = '/';
    }
  };

  const refreshUser = async () => {
    try {
      const res = await getMe();
      setUser(res.data);
      localStorage.setItem('univerdoc_user', JSON.stringify(res.data));
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login: loginUser,
        register: registerUser,
        logout: logoutUser,
        refreshUser,
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