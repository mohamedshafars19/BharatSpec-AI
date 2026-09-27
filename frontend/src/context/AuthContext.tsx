import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserLogin, UserSignup } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: UserLogin) => Promise<void>;
  signup: (payload: UserSignup) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bharatspec_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('bharatspec_token') || null;
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('bharatspec_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('bharatspec_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('bharatspec_token', token);
    } else {
      localStorage.removeItem('bharatspec_token');
    }
  }, [token]);

  const login = async (credentials: UserLogin) => {
    setIsLoading(true);
    try {
      const res = await api.login(credentials);
      setUser(res.user);
      setToken(res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (payload: UserSignup) => {
    setIsLoading(true);
    try {
      const res = await api.signup(payload);
      setUser(res.user);
      setToken(res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bharatspec_user');
    localStorage.removeItem('bharatspec_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        isLoading
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
