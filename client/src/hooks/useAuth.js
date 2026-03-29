import { createContext, createElement, useContext, useEffect, useState } from 'react';
import { authAPI, clearStoredAuth, getStoredAuth } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const stored = getStoredAuth();

      if (!stored.token) {
        setLoading(false);
        return;
      }

      setToken(stored.token);

      try {
        const response = await authAPI.getCurrentUser();
        setUser(response.data);
      } catch {
        clearStoredAuth();
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    const authData = response.data;

    if (!authData?.token || !authData?.user) {
      throw new Error('Invalid login response');
    }

    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData.user));
    setToken(authData.token);
    setUser(authData.user);

    return authData.user;
  };

  const signup = async (userData) => {
    const response = await authAPI.signup(userData);
    const authData = response.data;

    if (!authData?.token || !authData?.user) {
      throw new Error('Invalid signup response');
    }

    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData.user));
    setToken(authData.token);
    setUser(authData.user);

    return authData.user;
  };

  const logout = () => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
  };

  return createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        token,
        loading,
        isAuthenticated: Boolean(token && user),
        login,
        signup,
        logout,
      },
    },
    children
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
