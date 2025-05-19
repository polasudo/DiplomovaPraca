'use client';


import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, getCurrentUser, loginUser, registerUser, logoutUser, setAuthCookie, UserCredentials, UserRegistration } from '../api/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: UserCredentials) => Promise<void>;
  register: (userData: UserRegistration) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        setUser(null);
        console.error('Failed to load user:', err);
      } finally {
        setLoading(false);
      }
    };

    // Always try to load user on mount and when token changes
    loadUser();
    // Listen for storage changes (multi-tab logout/login)
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'authToken') {
        loadUser();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = async (credentials: UserCredentials) => {
    try {
      setLoading(true);
      setError(null);
      const { user, token } = await loginUser(credentials);
      
      // Ensure token is properly set in both localStorage and cookie
      if (token) {
        localStorage.setItem('authToken', token);
        sessionStorage.setItem('authToken', token);
        setAuthCookie(token);
      }
      
      setUser(user);
      
      // Force reload user state after login
      await new Promise(res => setTimeout(res, 100));
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: UserRegistration) => {
    try {
      setLoading(true);
      setError(null);
      // Register the user
      const { user, token } = await registerUser(userData);
      
      // Automatically log in the user after registration by storing the token
      if (token) {
        // Use the setAuthCookie function from authService
        setAuthCookie(token);
      }
      
      setUser(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    // Remove token from all storage locations
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};