// src/contexts/AwsAuthProvider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  register as apiRegister,
  login as apiLogin,
  logout as apiLogout,
  refreshSession as apiRefreshSession,
  UserData,
  CognitoTokens,
  RegisterRequest,
  LoginRequest,
  // Import storage utility and JWT decoder if they live in awsService.ts
  // Or define them here/in a shared utils file
} from '../api/awsService'; // Adjust path as needed

// Helper to decode JWT payload (basic implementation) - can be shared from awsService or a util
const decodeJwtPayload = (token: string): any | null => {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to decode JWT payload:", e);
        return null;
    }
};


interface AwsAuthContextType {
  user: UserData | null;
  tokens: CognitoTokens | null;
  loading: boolean; // Overall auth loading state
  isAuthenticated: boolean;
  register: (userData: RegisterRequest) => Promise<UserData>; // Consider what register should return
  login: (credentials: LoginRequest) => Promise<{ user: UserData; tokens: CognitoTokens }>;
  logout: () => void;
  refresh: () => Promise<CognitoTokens | null>;
  clearError: () => void;
  error: Error | null;
}

const AwsAuthContext = createContext<AwsAuthContextType | undefined>(undefined);

export const useAwsAuth = (): AwsAuthContextType => {
  const context = useContext(AwsAuthContext);
  if (context === undefined) {
    throw new Error('useAwsAuth must be used within an AwsAuthProvider');
  }
  return context;
};

interface AwsAuthProviderProps {
  children: ReactNode;
}

export const AwsAuthProvider: React.FC<AwsAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [tokens, setTokens] = useState<CognitoTokens | null>(null);
  const [loading, setLoading] = useState(true); // Initial loading state
  const [error, setError] = useState<Error | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const clearAuthData = useCallback(() => {
    localStorage.removeItem('aws_cognito_tokens');
    localStorage.removeItem('user_details');
    setUser(null);
    setTokens(null);
    setIsAuthenticated(false);
  }, []);
  
  // Load and validate tokens from localStorage on initial mount
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        const storedTokensStr = localStorage.getItem('aws_cognito_tokens');
        if (storedTokensStr) {
          const parsedTokens = JSON.parse(storedTokensStr) as CognitoTokens;
          const idTokenPayload = decodeJwtPayload(parsedTokens.idToken);
          const nowInSeconds = Math.floor(Date.now() / 1000);

          if (idTokenPayload && idTokenPayload.exp && idTokenPayload.exp > nowInSeconds) {
            // Token is present and not expired
            setTokens(parsedTokens);
            setIsAuthenticated(true);
            
            // Try to load user details from localStorage or decode from token
            const storedUserDetailsStr = localStorage.getItem('user_details');
            if (storedUserDetailsStr) {
                const storedUser = JSON.parse(storedUserDetailsStr) as UserData;
                // Optional: verify storedUser.userId matches token sub
                if (storedUser.userId === idTokenPayload.sub) {
                    setUser(storedUser);
                } else { // Mismatch, re-derive from token
                     setUser({
                        userId: idTokenPayload.sub,
                        email: idTokenPayload.email || '',
                        firstName: idTokenPayload.given_name || idTokenPayload.name || '',
                        lastName: idTokenPayload.family_name || '',
                        phoneNumber: idTokenPayload.phone_number || '',
                    });
                }
            } else { // No stored details, derive from token
                 setUser({
                    userId: idTokenPayload.sub,
                    email: idTokenPayload.email || '',
                    firstName: idTokenPayload.given_name || idTokenPayload.name || '',
                    lastName: idTokenPayload.family_name || '',
                    phoneNumber: idTokenPayload.phone_number || '',
                });
            }
            console.log("AuthProvider: Session loaded and validated from localStorage.");
          } else {
            // Token expired or invalid
            console.log("AuthProvider: Stored token expired or invalid, attempting refresh.");
            try {
                const refreshedTokens = await apiRefreshSession(); // refreshSession should save new tokens
                if(refreshedTokens) {
                    setTokens(refreshedTokens);
                    setIsAuthenticated(true);
                    const refreshedIdTokenPayload = decodeJwtPayload(refreshedTokens.idToken);
                    if (refreshedIdTokenPayload && refreshedIdTokenPayload.sub) {
                        setUser({
                            userId: refreshedIdTokenPayload.sub,
                            email: refreshedIdTokenPayload.email || '',
                            firstName: refreshedIdTokenPayload.given_name || refreshedIdTokenPayload.name || '',
                            lastName: refreshedIdTokenPayload.family_name || '',
                            phoneNumber: refreshedIdTokenPayload.phone_number || '',
                        });
                         console.log("AuthProvider: Session refreshed successfully.");
                    } else {
                        throw new Error("Failed to decode refreshed token.")
                    }
                } else {
                    clearAuthData(); // Refresh failed to return tokens
                }
            } catch (refreshErr) {
                console.warn("AuthProvider: Session refresh failed on initial load.", refreshErr);
                clearAuthData();
            }
          }
        } else {
          // No tokens found
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('AuthProvider: Error loading tokens on mount:', err);
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'aws_cognito_tokens' || event.key === 'user_details') {
        console.log("AuthProvider: Storage changed, reloading auth data.");
        initializeAuth(); // Re-initialize auth state if tokens/user details change in another tab
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [clearAuthData]); // Added clearAuthData to dependency array

  const register = useCallback(async (userData: RegisterRequest): Promise<UserData> => {
    setLoading(true);
    setError(null);
    try {
      // The apiRegister should call your backend /register, which handles Cognito signUp and adminConfirmSignUp
      const newUser = await apiRegister(userData);
      // After successful backend registration, the user is confirmed.
      // You might want to automatically log them in or prompt them to log in.
      // For now, we just update the user state if backend returns user details.
      // However, register typically doesn't log the user in immediately / provide tokens.
      // setUser(newUser); // This might be premature if registration doesn't auto-login
      console.log("Registration through provider successful, user data:", newUser);
      return newUser;
    } catch (err: any) {
      console.error('AuthProvider: Register error:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials: LoginRequest): Promise<{ user: UserData, tokens: CognitoTokens }> => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiLogin(credentials); // apiLogin now decodes token and returns UserData
      setUser(result.user);
      setTokens(result.tokens);
      setIsAuthenticated(true);
      // localStorage saving is handled within apiLogin
      console.log("AuthProvider: Login successful.", result.user);
      return result;
    } catch (err: any) {
      console.error('AuthProvider: Login error:', err);
      clearAuthData(); // Clear any partial auth state on login failure
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearAuthData]);

  const logout = useCallback(() => {
    setLoading(true); // Indicate activity
    try {
        apiLogout(); // This should clear localStorage and sign out from Cognito User Pool
        console.log("AuthProvider: Logout initiated.");
    } catch (err) {
        console.error("AuthProvider: Error during apiLogout", err)
    } finally {
        clearAuthData(); // Ensure frontend state is cleared regardless
        setLoading(false);
        console.log("AuthProvider: User logged out, state cleared.");
    }
  }, [clearAuthData]);

  const refresh = useCallback(async (): Promise<CognitoTokens | null> => {
    // No need to check isAuthenticated here, apiRefreshSession will handle no current user
    setLoading(true);
    setError(null);
    try {
      const newTokens = await apiRefreshSession(); // apiRefreshSession saves tokens and user details
      if (newTokens) {
        setTokens(newTokens);
        setIsAuthenticated(true);
         // Re-populate user from new token
        const idTokenPayload = decodeJwtPayload(newTokens.idToken);
        if (idTokenPayload && idTokenPayload.sub) {
            setUser({
                userId: idTokenPayload.sub,
                email: idTokenPayload.email || '',
                firstName: idTokenPayload.given_name || idTokenPayload.name || '',
                lastName: idTokenPayload.family_name || '',
                phoneNumber: idTokenPayload.phone_number || '',
            });
        }
        console.log("AuthProvider: Token refresh successful.");
        return newTokens;
      } else {
        // Refresh didn't return tokens, implies failure handled in apiRefreshSession (e.g. logout)
        // Ensure state reflects this
        clearAuthData();
        return null;
      }
    } catch (err: any) {
      console.error('AuthProvider: Refresh session error:', err);
      setError(err);
      logout(); // Force logout if refresh fails critically
      return null;
    } finally {
      setLoading(false);
    }
  }, [logout, clearAuthData]); // Added clearAuthData

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AwsAuthContextType = {
    user,
    tokens,
    loading,
    error,
    isAuthenticated,
    register,
    login,
    logout,
    refresh,
    clearError,
  };

  return <AwsAuthContext.Provider value={value}>{children}</AwsAuthContext.Provider>;
};