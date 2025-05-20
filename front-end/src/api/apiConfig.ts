// Centralized configuration for API endpoints and authentication

// Base API URL - should be set in environment variables
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com';

// Default request headers
export const getDefaultHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
});

// Authentication headers
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('authToken');
  return {
    ...getDefaultHeaders(),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

// Helper function to handle API responses
export const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: 'An unknown error occurred',
    }));
    throw new Error(errorData.message || `Error: ${response.status}`);
  }
  return response.json();
};

// Helper function for API requests
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    const url = `${API_URL}${endpoint}`;
    const response = await fetch(url, options);
    return handleApiResponse<T>(response);
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

// Import getAuthToken from authService
import { getAuthToken } from './authService';

// Authenticated API request
export const authenticatedRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const authOptions = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  };
  
  return apiRequest<T>(endpoint, authOptions);
};