// Feedback Service
// Handles user feedback submission and retrieval

import { DEFAULT_CONFIG, API_ENDPOINTS } from '../config/aws-config';

const API_URL = DEFAULT_CONFIG.API_URL; // Using the AWS API Gateway endpoint

export interface Feedback {
  feedbackId: string;
  userId: string;
  content: string;
  rating: number;
  createdAt: string;
}

export interface CreateFeedbackRequest {
  content: string;
  rating: number;
}

/**
 * Submit new feedback
 */
export const submitFeedback = async (feedbackData: CreateFeedbackRequest): Promise<Feedback> => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}${API_ENDPOINTS.PATHS.FEEDBACK.SUBMIT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(feedbackData),
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit feedback');
    }

    return response.json();
  } catch (error) {
    console.error('Submit feedback error:', error);
    throw error;
  }
};

/**
 * Get user's feedback history
 */
export const getUserFeedback = async (): Promise<Feedback[]> => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    // Using the same endpoint as submit but with GET method
    const response = await fetch(`${API_URL}${API_ENDPOINTS.PATHS.FEEDBACK.SUBMIT}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch feedback');
    }

    return response.json();
  } catch (error) {
    console.error('Get user feedback error:', error);
    throw error;
  }
};