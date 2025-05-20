# Front-End API Integration

This directory contains the API service files that connect the front-end application with the AWS serverless back-end services defined in the CloudFormation templates.

## AWS Serverless Backend Configuration

The AWS backend is configured with the following parameters:

- **API Endpoint Base URL**: `https://bunmjxpmhb.execute-api.eu-central-1.amazonaws.com/showcase`
- **Cognito User Pool ID**: `eu-central-1_XtloVwWis`
- **Cognito App Client ID**: `1rinvff05qeenrc9ia1rhgner9`

## Structure

- `apiConfig.ts` - Central configuration for API endpoints and authentication
- `authService.ts` - Authentication services (register, login, profile)
- `awsService.ts` - AWS Cognito integration and API services
- `orderService.ts` - Order management services
- `feedbackService.ts` - User feedback services
- `analyticsService.ts` - Analytics data services
- `index.ts` - Exports all services for easy imports

Additionally, we've created React hooks in `src/hooks/useAwsHooks.ts` and a new AWS Auth Context in `src/contexts/AwsAuthContext.tsx` to provide easy access to the AWS services.

## Usage

### AWS Cognito Authentication

```typescript
import { register, login, logout } from '../api/awsService';

// Register a new user
const registerUser = async () => {
  try {
    const userData = {
      email: 'user@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567890'
    };
    
    const result = await register(userData);
    console.log('Registration successful:', result);
  } catch (error) {
    console.error('Registration failed:', error);
  }
};

// Login
const loginUser = async () => {
  try {
    const credentials = {
      email: 'user@example.com',
      password: 'Password123!'
    };
    
    const { user, tokens } = await login(credentials);
    console.log('Login successful:', user);
    console.log('Tokens:', tokens);
    // tokens contains: idToken, accessToken, refreshToken
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Logout
const logoutUser = () => {
  logout();
  console.log('User logged out');
};
```

### Using React Hooks

```typescript
import { useAwsAuth } from '../contexts/AwsAuthContext';
import { useOrders, useFeedback, useAnalytics } from '../hooks/useAwsHooks';

// Authentication Hook
const AuthComponent = () => {
  const { 
    user, 
    tokens, 
    loading, 
    error, 
    isAuthenticated, 
    register, 
    login, 
    logout 
  } = useAwsAuth();
  
  // Use these values and functions in your component
};

// Orders Hook
const OrdersComponent = () => {
  const { 
    orders, 
    loading, 
    error, 
    getOrders, 
    getOrderById, 
    createOrder 
  } = useOrders();
  
  // Fetch orders for a user
  useEffect(() => {
    getOrders('userId123');
  }, []);
};
```

### Orders API

```typescript
import { createOrder, getOrders, getOrderById } from '../api/awsService';

// Create a new order (authenticated)
const createNewOrder = async () => {
  try {
    const orderData = {
      items: [
        { productId: 'product123', quantity: 2 },
        { productId: 'product456', quantity: 1 }
      ]
    };
    
    const newOrder = await createOrder(orderData);
    console.log('Order created:', newOrder);
  } catch (error) {
    console.error('Failed to create order:', error);
  }
};

// Get orders for a user (authenticated)
const fetchUserOrders = async (userId) => {
  try {
    const orders = await getOrders(userId);
    console.log('User orders:', orders);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
  }
};

// Get specific order details (authenticated)
const fetchOrderDetails = async (orderId) => {
  try {
    const order = await getOrderById(orderId);
    console.log('Order details:', order);
  } catch (error) {
    console.error('Failed to fetch order details:', error);
  }
};
```

### Feedback and Analytics

```typescript
import { submitFeedback, getAnalytics } from '../api/awsService';

// Submit feedback (authenticated)
const sendFeedback = async () => {
  try {
    const feedback = {
      rating: 5,
      comment: 'Great service!',
      category: 'customer-support'
    };
    
    const result = await submitFeedback(feedback);
    console.log('Feedback submitted:', result);
  } catch (error) {
    console.error('Failed to submit feedback:', error);
  }
};

// Get analytics data (authenticated)
const fetchAnalytics = async () => {
  try {
    const analytics = await getAnalytics();
    console.log('Analytics data:', analytics);
    // analytics contains: userCount, orderCount, totalRevenue, popularProducts
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
  }
};
```

## Configuration

The AWS API configuration is centralized in the `awsService.ts` file with the following constants:

```typescript
const AWS_CONFIG = {
  API_URL: 'https://bunmjxpmhb.execute-api.eu-central-1.amazonaws.com/showcase',
  COGNITO_USER_POOL_ID: 'eu-central-1_XtloVwWis',
  COGNITO_CLIENT_ID: '1rinvff05qeenrc9ia1rhgner9'
};
```

For local development or testing with different environments, you can modify these values or use environment variables.

## Authentication Flow

The authentication flow is implemented using Amazon Cognito Identity JS and consists of the following steps:

1. **Registration**:
   - User submits registration form with email, password, firstName, lastName, and phoneNumber
   - The `register` function in `awsService.ts` creates a new user in Cognito
   - After successful registration, the user can log in

2. **Login**:
   - User submits login form with email and password
   - The `login` function authenticates with Cognito and receives tokens (idToken, accessToken, refreshToken)
   - Tokens are stored in localStorage for persistence
   - User data is retrieved and stored in the authentication context

3. **Token Management**:
   - Tokens are automatically included in authenticated API requests
   - The `refreshSession` function can be used to refresh expired tokens
   - Tokens are cleared on logout

4. **Authentication Context**:
   - The `AwsAuthContext` provider in `src/contexts/AwsAuthContext.tsx` manages authentication state
   - Components can access authentication state and methods using the `useAwsAuth` hook
   - Protected routes can check `isAuthenticated` to control access

## Error Handling

All AWS API services include comprehensive error handling that will:

1. Log detailed errors to the console for debugging
2. Return structured error messages to the UI
3. Handle authentication errors by redirecting to login when needed
4. Provide type-safe error handling with TypeScript

Each React hook (`useAuth`, `useOrders`, etc.) includes error state management that components can use to display appropriate error messages to users.

## Security

### Token Management

The AWS Cognito integration includes secure token management:

1. **Token Storage**: Tokens (idToken, accessToken, refreshToken) are stored in localStorage with the key `aws_cognito_tokens`
2. **Authorization Headers**: The `apiRequest` function automatically adds the idToken to the Authorization header for authenticated requests
3. **Token Refresh**: The `refreshSession` function can be used to refresh expired tokens
4. **Token Validation**: Tokens are validated on application startup

### Protected Routes

Routes that require authentication can use the `isAuthenticated` state from the `useAwsAuth` hook to control access:

```typescript
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAwsAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);
  
  if (loading) return <LoadingSpinner />;
  return isAuthenticated ? children : null;
};
```

## API Endpoints Reference

| Endpoint | Method | Authentication | Description | Request Payload | Response |
|----------|--------|----------------|-------------|-----------------|----------|
| `/register` | POST | No | Register a new user | `{ email, password, firstName, lastName, phoneNumber }` | User data |
| `/login` | POST | No | Login a user | `{ email, password }` | `{ user, tokens }` |
| `/orders` | POST | Yes | Create a new order | `{ items: [{ productId, quantity }] }` | Order details |
| `/orders?userId=...` | GET | Yes | List orders for a user | - | Array of orders |
| `/orders/{orderId}` | GET | Yes | Get specific order details | - | Order details |
| `/feedback` | POST | Yes | Submit feedback | `{ rating, comment, category }` | `{ success: true }` |
| `/analytics` | GET | Yes | Get analytics data | - | Analytics data |