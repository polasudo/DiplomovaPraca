// Analytics Service
// Handles analytics data retrieval

import { API_ENDPOINTS, DEFAULT_CONFIG } from '../config/aws-config';

const API_URL = DEFAULT_CONFIG.API_URL;

export interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  topProducts: {
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }[];
  ordersByStatus: {
    status: string;
    count: number;
  }[];
  revenueByPeriod: {
    period: string;
    revenue: number;
  }[];
}

/**
 * Get analytics data
 */
export const getAnalyticsData = async (): Promise<AnalyticsData> => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}${API_ENDPOINTS.PATHS.ANALYTICS}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch analytics data');
    }

    return response.json();
  } catch (error) {
    console.error('Get analytics data error:', error);
    throw error;
  }
};