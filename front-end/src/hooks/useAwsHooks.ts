// src/hooks/useAwsHooks.ts
import { useState, useCallback } from 'react';
import {
  // RegisterRequest, LoginRequest, UserData, CognitoTokens,
  Order,
  CreateOrderPayload, // Using the more complete type for the payload
  FeedbackRequest,
  FeedbackResponse,
  AnalyticsData,
  fetchOrders,
  fetchOrderById,
  createNewOrder, // This is the function that takes CreateOrderPayload
  sendFeedback,
  fetchAnalytics,
} from '../api/awsService'; // Adjust path

// Hook for orders
export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getOrders = useCallback(async (userId?: string) => {
    setLoading(true);
    setError(null);
    try {
      // fetchOrders from awsService now returns { orders: Order[], count: number, nextToken?: string }
      const result = await fetchOrders(userId); 
      setOrders(result.orders);
      return result.orders; // Or return the whole result if you need count/nextToken
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrderById = useCallback(async (orderId: string) => {
    setLoading(true);
    setError(null);
    try {
      // fetchOrderById from awsService now returns { order: Order }
      const result = await fetchOrderById(orderId);
      return result.order;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // This function now expects the full CreateOrderPayload
  const createOrder = useCallback(async (orderData: CreateOrderPayload): Promise<Order> => {
    setLoading(true);
    setError(null);
    try {
      console.log('useOrders: Calling createNewOrder with items:', orderData.items.length);
      const newOrder = await createNewOrder(orderData); // Pass the full payload
      console.log('useOrders: Order created successfully:', newOrder.orderId);
      // Optimistically update or re-fetch
      setOrders(prev => {
        // Avoid duplicates if already added by a direct mutation in component
        if (prev.find(o => o.orderId === newOrder.orderId)) {
            return prev.map(o => o.orderId === newOrder.orderId ? newOrder : o);
        }
        return [...prev, newOrder];
      });
      return newOrder;
    } catch (err: any) {
      console.error('useOrders: Error creating order:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { orders, loading, error, getOrders, getOrderById, createOrder };
};

// Hook for feedback
export const useFeedback = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);

  const submitFeedback = useCallback(async (feedback: FeedbackRequest) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const result = await sendFeedback(feedback); // sendFeedback from awsService
      setSuccess(result.success || !!result.feedbackId); // Assuming success if feedbackId is returned
      return result;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, success, submitFeedback };
};

// Hook for analytics
export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getAnalytics = useCallback(async (reportType?: string) => {
    setLoading(true);
    setError(null);
    try {
      // fetchAnalytics from awsService now returns { analyticsReport: AnalyticsData }
      const result = await fetchAnalytics(reportType); 
      setAnalytics(result.analyticsReport);
      return result.analyticsReport;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { analytics, loading, error, getAnalytics };
};