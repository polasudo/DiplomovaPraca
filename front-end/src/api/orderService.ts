// Order Service
// Handles order creation, retrieval, and management

import { DEFAULT_CONFIG, API_ENDPOINTS } from '../config/aws-config';
import { getAuthToken } from './authService';

const API_URL = DEFAULT_CONFIG.API_URL;

export interface Order {
  orderId: string;
  userId: string;
  products: OrderProduct[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface OrderProduct {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface CreateOrderRequest {
  products: {
    productId: string;
    quantity: number;
  }[];
}

/**
 * Create a new order
 */
export const createOrder = async (orderData: CreateOrderRequest): Promise<Order> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}${API_ENDPOINTS.PATHS.ORDERS.CREATE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create order');
    }

    return response.json();
  } catch (error) {
    console.error('Create order error:', error);
    throw error;
  }
};

/**
 * Get all orders for the current user
 */
export const getUserOrders = async (): Promise<Order[]> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}${API_ENDPOINTS.PATHS.ORDERS.GET_ALL}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch orders');
    }

    return response.json();
  } catch (error) {
    console.error('Get user orders error:', error);
    throw error;
  }
};

/**
 * Get a specific order by ID
 */
export const getOrderById = async (orderId: string): Promise<Order> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}${API_ENDPOINTS.PATHS.ORDERS.GET_BY_ID}/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch order');
    }

    return response.json();
  } catch (error) {
    console.error('Get order by ID error:', error);
    throw error;
  }
};

/**
 * Cancel an order
 */
export const cancelOrder = async (orderId: string): Promise<Order> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to cancel order');
    }

    return response.json();
  } catch (error) {
    console.error('Cancel order error:', error);
    throw error;
  }
};