# Front-End API Integration

This directory contains the API service files that connect the front-end application with the AWS serverless back-end services defined in the CloudFormation templates.

## Structure

- `apiConfig.ts` - Central configuration for API endpoints and authentication
- `authService.ts` - Authentication services (register, login, profile)
- `orderService.ts` - Order management services
- `feedbackService.ts` - User feedback services
- `index.ts` - Exports all services for easy imports

## Usage

### Authentication

```typescript
import { registerUser, loginUser, getCurrentUser } from '../api';

// Register a new user
const newUser = await registerUser({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'securepassword'
});

// Login
const { user, token } = await loginUser({
  email: 'john@example.com',
  password: 'securepassword'
});

// Get current user profile
const currentUser = await getCurrentUser();
```

### Orders

```typescript
import { createOrder, getUserOrders, getOrderById } from '../api';

// Create a new order
const newOrder = await createOrder({
  products: [
    { productId: 'product123', quantity: 2 }
  ]
});

// Get user's orders
const orders = await getUserOrders();

// Get specific order
const order = await getOrderById('order123');
```

### Feedback

```typescript
import { submitFeedback, getUserFeedback } from '../api';

// Submit feedback
const feedback = await submitFeedback({
  content: 'Great service!',
  rating: 5
});

// Get user's feedback
const feedbackHistory = await getUserFeedback();
```

## Configuration

The API base URL is configured in each service file and can be set using the environment variable `NEXT_PUBLIC_API_URL`. If not set, it defaults to a placeholder URL.

To set the API URL for development, create a `.env.local` file in the project root with:

```
NEXT_PUBLIC_API_URL=https://your-api-gateway-url.execute-api.region.amazonaws.com/stage
```

## Authentication Flow

The authentication flow is managed by the `AuthContext` provider in `src/contexts/AuthContext.tsx`. This context provides authentication state and methods to all components in the application.

## Error Handling

All API services include error handling that will:

1. Log errors to the console
2. Return structured error messages
3. Handle authentication errors appropriately

## Security

API requests that require authentication will automatically include the JWT token from local storage. If the token is missing or invalid, the requests will fail with appropriate error messages.