// src/api/awsService.ts
import {
    CognitoUserPool,
    CognitoUser,
    AuthenticationDetails,
    CognitoUserSession,
    CognitoUserAttribute,
    ICognitoUserAttributeData
  } from 'amazon-cognito-identity-js';
  
  // --- Configuration ---
  const AWS_CONFIG = {
    API_URL: 'https://bunmjxpmhb.execute-api.eu-central-1.amazonaws.com/showcase', // Your latest API URL
    COGNITO_USER_POOL_ID: 'eu-central-1_XtloVwWis', // Your latest User Pool ID
    COGNITO_CLIENT_ID: '1rinvff05qeenrc9ia1rhgner9', // Your latest Client ID
  };
  
  const userPool = new CognitoUserPool({
    UserPoolId: AWS_CONFIG.COGNITO_USER_POOL_ID,
    ClientId: AWS_CONFIG.COGNITO_CLIENT_ID,
  });
  
  // --- Types ---
  // (Ensure these match your backend and frontend needs accurately)
  
  export interface RegisterRequest {
    email: string;
    password?: string; // Password for Cognito signup
    firstName: string;
    lastName: string;
    phoneNumber?: string; // Make optional if not always provided
  }
  
  export interface LoginRequest {
    email: string;
    password?: string;
  }
  
  export interface CognitoTokens {
    idToken: string;
    accessToken: string;
    refreshToken: string;
    expiresIn?: number; // Optional, can be calculated
  }
  
  export interface UserData { // Data representing the authenticated user
    userId: string; // Cognito 'sub'
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  }
  
  export interface BackendOrderItem {
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }
  
  export interface ShippingAddress {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  }
  
  // Payload for creating an order, sent to your backend
  export interface CreateOrderPayload {
    userId: string;
    items: BackendOrderItem[];
    shippingAddress: ShippingAddress;
    paymentMethod?: string;
    notes?: string;
  }
  
  // Order structure returned by your backend
  export interface Order {
    totalAmount: number;
    orderId: string;
    userId: string;
    items: BackendOrderItem[];
    orderTotal: number; // Matching backend response
    status: string;
    createdAt: string | number;
    updatedAt?: string | number;
    paymentMethod?: string;
    shippingAddress?: ShippingAddress;
  }
  
  export interface FeedbackRequest {
    userId: string; // Ensure userId is part of feedback if required by backend
    orderId?: string;
    rating: number;
    comment: string;
    category?: string;
  }
  
  export interface FeedbackResponse {
    message: string;
    feedbackId: string;
    success?: boolean; // For frontend state
  }
  
  export interface AnalyticsData {
    popularProducts: boolean;
    orderCount: number;
    userCount: number;
    totalCustomers?: number | string;
    totalOrders?: number | string;
    totalRevenue?: number | string;
    orderStatusDistribution?: Record<string, number> | string;
  }
  
  // --- Token Storage Utilities ---
  const TOKEN_STORAGE_KEY = 'aws_cognito_tokens'; // For tokens from amazon-cognito-identity-js
  const USER_DETAILS_STORAGE_KEY = 'user_details'; // For decoded user info
  
  const saveTokensToLocalStorage = (tokens: CognitoTokens): void => {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
  };
  
  const getTokensFromLocalStorage = (): CognitoTokens | null => {
    const tokensStr = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!tokensStr) return null;
    try {
      return JSON.parse(tokensStr) as CognitoTokens;
    } catch (error) {
      console.error('Error parsing tokens from localStorage:', error);
      localStorage.removeItem(TOKEN_STORAGE_KEY); // Clear corrupted data
      return null;
    }
  };
  
  const saveUserDetailsToLocalStorage = (user: UserData): void => {
    localStorage.setItem(USER_DETAILS_STORAGE_KEY, JSON.stringify(user));
  }
  
  const getUserDetailsFromLocalStorage = (): UserData | null => {
    const userStr = localStorage.getItem(USER_DETAILS_STORAGE_KEY);
     if (!userStr) return null;
    try {
      return JSON.parse(userStr) as UserData;
    } catch (error) {
      console.error('Error parsing user details from localStorage:', error);
      localStorage.removeItem(USER_DETAILS_STORAGE_KEY);
      return null;
    }
  }
  
  const clearAuthStorage = (): void => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_DETAILS_STORAGE_KEY);
    // Also clear any cookies if your authService was setting them
  };
  
  // Helper to decode JWT payload (basic implementation for client-side info extraction)
  const decodeJwtPayload = (token: string): any | null => {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Failed to decode JWT payload:", e);
      return null;
    }
  };
  
  
  // Helper function to get authorization header
  // Prefers idToken from localStorage, managed by this service.
  const getAuthHeader = (): { Authorization: string } | {} => {
    const tokens = getTokensFromLocalStorage();
    if (tokens?.idToken) {
      // Basic expiration check (client-side, server will validate fully)
      // For robust check, use a JWT library or rely on refresh mechanism
      const payload = decodeJwtPayload(tokens.idToken);
      const nowInSeconds = Math.floor(Date.now() / 1000);
      if (payload && payload.exp && payload.exp < nowInSeconds) {
        console.warn('ID token from localStorage is expired. Attempt refresh or re-login.');
        // Ideally, trigger refresh here or throw an error that prompts refresh
        // For now, returning empty to force a 401 which might trigger refresh in apiRequest
        return {}; 
      }
      console.log('Using idToken from Cognito localStorage for Authorization');
      return { Authorization: tokens.idToken }; // No "Bearer " prefix for direct Cognito User Pool Authorizer
    }
    console.warn('No ID token available in localStorage for API request');
    return {};
  };
  
  // API request helper
  const apiRequest = async <T>(
    endpoint: string,
    method: string = 'GET',
    body?: any,
    requiresAuth: boolean = true,
    isRetry: boolean = false // Internal flag for retry logic
  ): Promise<T> => {
    const url = `${AWS_CONFIG.API_URL}${endpoint}`;
    const authHeaders = requiresAuth ? getAuthHeader() : {};
  
    if (requiresAuth && Object.keys(authHeaders).length === 0 && !isRetry) {
      // If no token and it's not a retry after refresh, try refreshing.
      console.warn(`No auth token for ${endpoint}. Attempting refresh...`);
      try {
        await refreshSession(); // This should update localStorage if successful
        // After refresh, getAuthHeader will be called again in the retry attempt
        return apiRequest<T>(endpoint, method, body, requiresAuth, true); // Retry once after refresh
      } catch (refreshError) {
        console.error('Token refresh failed during apiRequest. Proceeding without token or failing.', refreshError);
        // Proceed to make the call (will likely fail with 401) or throw specific error
        // For simplicity, we let it proceed, and it might fail with 401 if token wasn't obtained.
      }
    }
    
    // Re-fetch auth headers in case they were updated by a refresh during retry
    const currentAuthHeaders = requiresAuth ? getAuthHeader() : {};
  
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...currentAuthHeaders,
    };
  
    const options: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    };
  
    console.log(`Making ${method} request to ${url}${isRetry ? ' (after token refresh attempt)' : ''}`);
    if (requiresAuth && Object.keys(currentAuthHeaders).length === 0) {
       console.error(`Authentication required for ${endpoint} but no token available even after potential refresh.`);
       // Decide: throw error here or let the API call fail with 401
    }
  
  
    const response = await fetch(url, options);
  
    if (response.status === 401 && requiresAuth && !isRetry) {
      console.warn('API request resulted in 401 (Unauthorized). Refresh might have failed or token still invalid.');
      // Not attempting another refresh to avoid loops if refresh itself is failing or not providing a valid token.
    }
  
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json(); // Try to parse error from backend
      } catch (e) {
        errorData = { error: await response.text() || `API request failed with status ${response.status}` };
      }
      console.error(`API Error (${response.status}) for ${method} ${endpoint}:`, errorData);
      throw new Error(errorData.error || `API request failed: ${response.status}`);
    }
  
    // For 204 No Content, response.json() will fail.
    if (response.status === 204) {
      return {} as T; // Or handle as appropriate for your use case
    }
    
    return response.json();
  };
  
  
  // --- Authentication Service Functions ---
  export const register = async (userData: RegisterRequest): Promise<UserData> => {
    // This function will call your backend /register endpoint.
    // Your backend /register Lambda should handle Cognito userPool.signUp AND adminConfirmSignUp.
    console.log("Calling backend API for registration:", userData);
    const backendResponse = await apiRequest<any>( // Expecting { message, userSub }
      '/register', 
      'POST', 
      { // Ensure payload matches what backend Lambda expects
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber
      }, 
      false // Registration typically doesn't require auth
    );
  
    if (backendResponse && backendResponse.userSub) {
      return {
        userId: backendResponse.userSub,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber
      };
    } else {
      throw new Error(backendResponse.error || "Registration with backend API failed to return userSub.");
    }
  };
  
  export const login = (credentials: LoginRequest): Promise<{ user: UserData, tokens: CognitoTokens }> => {
    return new Promise((resolve, reject) => {
      const authenticationDetails = new AuthenticationDetails({
        Username: credentials.email,
        Password: credentials.password,
      });
      const cognitoUser = new CognitoUser({ Username: credentials.email, Pool: userPool });
  
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (session: CognitoUserSession) => {
          console.log('Cognito authenticateUser onSuccess');
          const cognitoTokens: CognitoTokens = {
            idToken: session.getIdToken().getJwtToken(),
            accessToken: session.getAccessToken().getJwtToken(),
            refreshToken: session.getRefreshToken().getToken(),
            // expiresIn: session.getIdToken().getExpiration() - Math.floor(Date.now() / 1000),
          };
          saveTokensToLocalStorage(cognitoTokens);
  
          const idTokenPayload = decodeJwtPayload(cognitoTokens.idToken);
          if (idTokenPayload && idTokenPayload.sub) {
            const userData: UserData = {
              userId: idTokenPayload.sub,
              email: idTokenPayload.email || credentials.email,
              firstName: idTokenPayload.given_name || idTokenPayload.name || '',
              lastName: idTokenPayload.family_name || '',
              phoneNumber: idTokenPayload.phone_number || '',
            };
            saveUserDetailsToLocalStorage(userData); // Save decoded user details
            console.log("User data constructed from ID token and saved:", userData);
            resolve({ user: userData, tokens: cognitoTokens });
          } else {
            console.error("Failed to decode idToken or 'sub' claim missing after Cognito login.");
            reject(new Error("Failed to process user identity after login."));
          }
        },
        onFailure: (err) => {
          console.error('Cognito authenticateUser onFailure:', err);
          clearAuthStorage();
          reject(err);
        },
        // Optional: Handle newPasswordRequired if your user pool is configured for it
        // newPasswordRequired: (userAttributes, requiredAttributes) => {
        //   console.log('New password required for user:', userAttributes);
        //   // Remove 'email_verified' and other unneeded attributes if they cause issues
        //   delete userAttributes.email_verified; 
        //   delete userAttributes.phone_number_verified;
        //   // Collect new password from user and call cognitoUser.completeNewPasswordChallenge
        //   reject({ name: 'NewPasswordRequired', attributes: userAttributes });
        // }
      });
    });
  };
  
  export const logout = (): void => {
    const currentUser = userPool.getCurrentUser();
    if (currentUser) {
      currentUser.signOut();
      console.log('Cognito user signed out.');
    }
    clearAuthStorage();
    console.log('Local tokens and user details cleared.');
    // Optionally, notify backend if needed
  };
  
  export const refreshSession = async (): Promise<CognitoTokens | null> => {
    console.log('Attempting to refresh Cognito session...');
    const currentUser = userPool.getCurrentUser();
    if (!currentUser) {
      console.warn('No current user for session refresh.');
      clearAuthStorage();
      return Promise.reject(new Error('No current user'));
    }
  
    const currentTokens = getTokensFromLocalStorage();
    if (!currentTokens?.refreshToken) {
      console.warn('No refresh token available.');
      clearAuthStorage();
      return Promise.reject(new Error('No refresh token'));
    }
    
    // amazon-cognito-identity-js handles getSession and refresh internally
    return new Promise((resolve, reject) => {
      currentUser.getSession((err: Error | null, session: CognitoUserSession | false | null) => {
        if (err) {
          console.error('Error getting/refreshing session:', err);
          // If refresh fails (e.g. "Refresh Token has been revoked"), clear tokens and logout
          if (err.name === 'InvalidRefreshException' || (err.message && err.message.toLowerCase().includes('revoked'))) {
              logout(); // Clears storage and signs out Cognito user
          }
          return reject(err);
        }
        if (session && typeof session !== 'boolean' && session.isValid()) {
          const newTokens: CognitoTokens = {
            idToken: session.getIdToken().getJwtToken(),
            accessToken: session.getAccessToken().getJwtToken(),
            refreshToken: session.getRefreshToken().getToken(),
          };
          saveTokensToLocalStorage(newTokens);
          console.log('Cognito session refreshed and tokens saved.');
  
          // Also update user details from the new ID token
          const idTokenPayload = decodeJwtPayload(newTokens.idToken);
          if (idTokenPayload && idTokenPayload.sub) {
            const userData: UserData = {
              userId: idTokenPayload.sub,
              email: idTokenPayload.email || '',
              firstName: idTokenPayload.given_name || idTokenPayload.name || '',
              lastName: idTokenPayload.family_name || '',
              phoneNumber: idTokenPayload.phone_number || '',
            };
            saveUserDetailsToLocalStorage(userData);
          }
          resolve(newTokens);
        } else {
          console.error('Failed to get a valid session after refresh attempt.');
          clearAuthStorage(); // Session is invalid
          reject(new Error('Session is invalid after refresh attempt'));
        }
      });
    });
  };
  
  
  // --- Order API Functions ---
  export const createNewOrder = (orderData: CreateOrderPayload): Promise<Order> => {
    console.log('awsService: createNewOrder called with payload:', JSON.stringify(orderData, null, 2));
    return apiRequest<Order>('/orders', 'POST', orderData, true);
  };
  
  export const fetchOrders = (userId?: string): Promise<{ orders: Order[], count: number, nextToken?: string }> => {
    const endpoint = userId ? `/orders?userId=${encodeURIComponent(userId)}` : '/orders';
    return apiRequest<{ orders: Order[], count: number, nextToken?: string }>(endpoint, 'GET', undefined, true);
  };
  
  export const fetchOrderById = (orderId: string): Promise<{ order: Order }> => {
    return apiRequest<{ order: Order }>(`/orders/${orderId}`, 'GET', undefined, true);
  };
  
  // --- Feedback API Function ---
  export const sendFeedback = (feedbackData: FeedbackRequest): Promise<FeedbackResponse> => {
    return apiRequest<FeedbackResponse>('/feedback', 'POST', feedbackData, true);
  };
  
  // --- Analytics API Function ---
  export const fetchAnalytics = (reportType?: string): Promise<{analyticsReport: AnalyticsData}> => {
    const endpoint = reportType ? `/analytics?reportType=${encodeURIComponent(reportType)}` : '/analytics';
    return apiRequest<{analyticsReport: AnalyticsData}>(endpoint, 'GET', undefined, true);
  };