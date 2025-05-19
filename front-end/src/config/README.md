# AWS Infrastructure Configuration

## Overview

This directory contains configuration files that centralize all AWS infrastructure endpoints and resource identifiers extracted from CloudFormation templates. This ensures consistent access to AWS resources across the application and makes it easier to update endpoints when infrastructure changes.

## Files

### aws-config.ts

This file centralizes all AWS infrastructure endpoints and resource identifiers:

- **API_ENDPOINTS**: Contains the base URL for the API Gateway and paths for different resources (tasks, products, auth, orders, feedback)
- **DYNAMODB_TABLES**: Names of DynamoDB tables used by the application
- **COGNITO_CONFIG**: Configuration for Cognito user pools and client IDs
- **DEFAULT_CONFIG**: Default configuration values for the application

## Usage

To use the centralized configuration in your code:

```typescript
import { API_ENDPOINTS, DEFAULT_CONFIG } from '../config/aws-config';

// Use the base URL
const apiUrl = DEFAULT_CONFIG.API_URL;

// Use specific API endpoints
const tasksEndpoint = `${apiUrl}${API_ENDPOINTS.PATHS.TASKS.GET_ALL}`;
const productsEndpoint = `${apiUrl}${API_ENDPOINTS.PATHS.PRODUCTS.GET_ALL}`;
```

## Benefits

- **Centralized Management**: All AWS resource identifiers and endpoints are managed in one place
- **Consistency**: Ensures consistent access to AWS resources across the application
- **Maintainability**: Makes it easier to update endpoints when infrastructure changes
- **Environment Support**: Supports different environments through environment variables

## Environment Variables

The configuration supports environment-specific settings through environment variables:

- **NEXT_PUBLIC_API_URL**: Override the default API URL for different environments

If not specified, the configuration will use the default values extracted from CloudFormation templates.