// Authentication Service
// Handles user registration, login, and authentication state

import { DEFAULT_CONFIG, API_ENDPOINTS } from '../config/aws-config';

const API_URL = DEFAULT_CONFIG.API_URL;

export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserRegistration extends UserCredentials {
  firstName: string;
  lastName: string;
}

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

/**
 * Register a new user
 */
export const registerUser = async (userData: UserRegistration): Promise<{ user: User; token: string }> => {
  try {
    const response = await fetch(`${API_URL}${API_ENDPOINTS.PATHS.AUTH.REGISTER}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    const data = await response.json();
    
    // Store token in cookie with proper settings
    if (data.token) {
      setAuthCookie(data.token);
    }
    
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Login a user
 */
export const loginUser = async (credentials: UserCredentials): Promise<{ user: User; token: string }> => {
  try {
    const response = await fetch(`${API_URL}${API_ENDPOINTS.PATHS.AUTH.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    // Store token in cookie, localStorage, and sessionStorage for robust session management
    setAuthCookie(data.token);
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      sessionStorage.setItem('authToken', data.token);
      
      // Store user data in localStorage for persistence
      if (data.user) {
        localStorage.setItem('currentUser', JSON.stringify(data.user));
      }
    }
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      return null;
    }

    // Try to get user from localStorage first as a fallback
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        // If parsing fails, continue with API call
        console.warn('Failed to parse stored user data');
      }
    }
    
    try {
      // Try to fetch from API
      const response = await fetch(`${API_URL}${API_ENDPOINTS.PATHS.AUTH.CURRENT_USER}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearAuthToken();
          return null;
        }
        throw new Error('Failed to get user profile');
      }

      const userData = await response.json();
      // Store user data in localStorage for future use
      localStorage.setItem('currentUser', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Get current user error:', error);
      // If API call fails but we have a token, return a minimal user object
      // This is a workaround for the missing /me endpoint
      if (token) {
        // Try to decode the JWT token to get user info
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const payload = JSON.parse(jsonPayload);
          const user = {
            userId: payload.sub || 'unknown',
            email: payload.email || 'unknown',
            firstName: payload['custom:given_name'] || payload.given_name || '',
            lastName: payload['custom:family_name'] || payload.family_name || ''
          };
          
          // Store this user data
          localStorage.setItem('currentUser', JSON.stringify(user));
          return user;
        } catch (e) {
          console.error('Failed to decode token:', e);
        }
      }
      return null;
    }
  } catch (error) {
    console.error('Get current user outer error:', error);
    return null;
  }
};

/**
 * Logout the current user
 */
export const logoutUser = (): void => {
  clearAuthToken();
};

/**
 * Set authentication token in both cookie and localStorage for better persistence
 */
export const setAuthCookie = (token: string): void => {
  // Set in localStorage as fallback
  localStorage.setItem('authToken', token);
  
  // Set in cookie with proper attributes
  const secure = window.location.protocol === 'https:';
  const sameSite = secure ? 'none' : 'lax';
  
  // Set cookie to expire in 7 days
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);
  
  document.cookie = `authToken=${token}; expires=${expiryDate.toUTCString()}; path=/; ${secure ? 'secure;' : ''} samesite=${sameSite};`;
};

/**
 * Get authentication token from cookie or localStorage
 */
export const getAuthToken = (): string | null => {
  // Try to get from cookie first
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith('authToken=')) {
      return cookie.substring('authToken='.length, cookie.length);
    }
  }
  
  // Fallback to localStorage
  const localToken = localStorage.getItem('authToken');
  
  // If token exists in localStorage but not in cookie, restore the cookie
  if (localToken && cookies.every(c => !c.trim().startsWith('authToken='))) {
    setAuthCookie(localToken);
  }
  
  return localToken;
};

/**
 * Clear authentication token from both cookie and localStorage
 */
export const clearAuthToken = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  sessionStorage.removeItem('authToken');
  document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};