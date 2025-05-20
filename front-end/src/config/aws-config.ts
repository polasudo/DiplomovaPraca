/**
 * AWS Infrastructure Configuration
 * 
 * This file centralizes all AWS infrastructure endpoints and resource identifiers
 * extracted from CloudFormation templates to ensure consistent access across the application.
 */

// API Gateway endpoints
export const API_ENDPOINTS = {
  // Main API Gateway endpoint from scale-up template
  BASE_URL: "https://bunmjxpmhb.execute-api.eu-central-1.amazonaws.com/showcase",
  
  // API paths for different resources
  PATHS: {
    // Root endpoint
    ROOT: "/",
    
    // Health check endpoint
    HEALTH: "/health",
    
    // Analytics endpoint
    ANALYTICS: "/analytics",
    
    // Auth endpoints
    AUTH: {
      REGISTER: "/register",
      LOGIN: "/login",
      CURRENT_USER: "/me"
    },
    
    // Order endpoints
    ORDERS: {
      CREATE: "/orders",
      GET_ALL: "/orders",
      GET_BY_ID: "/orders/{orderId}"
    },
    TASKS: {
      CREATE: "/tasks",
      GET_ALL: "/tasks",
      UPDATE: "/tasks/{taskId}",
      GET_BY_ID: "/tasks/{taskId}",
      DELETE: "/tasks/{taskId}" 
    },

    // Feedback endpoint
    FEEDBACK: {
      SUBMIT: "/feedback"
    }
  }
};

// Default configuration
export const DEFAULT_CONFIG = {
  REGION: "eu-central-1",
  API_URL: API_ENDPOINTS.BASE_URL,
  COGNITO: {
    USER_POOL_ID: "eu-central-1_example",
    APP_CLIENT_ID: "example"
  }
};