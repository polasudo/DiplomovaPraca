// API Service for centralized API calls
import { API_ENDPOINTS, DEFAULT_CONFIG } from '../config/aws-config';

const API_BASE_URL = DEFAULT_CONFIG.API_URL;

// Generic fetch function with error handling
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
}

// Health check endpoint
export async function checkApiHealth(): Promise<{ status: string }> {
  return fetchAPI<{ status: string }>(API_ENDPOINTS.PATHS.HEALTH);
}

// Tasks API
export interface Task {
  id: string;
  name: string;
  description: string;
  value: string;
}

export async function getTasks(): Promise<Task[]> {
  return fetchAPI<Task[]>(API_ENDPOINTS.PATHS.TASKS.GET_ALL);
}

export async function createTask(task: Omit<Task, 'id'>): Promise<{ id: string }> {
  return fetchAPI<{ id: string }>(API_ENDPOINTS.PATHS.TASKS.CREATE, {
    method: 'POST',
    body: JSON.stringify(task),
  });
}

export async function deleteTask(id: string): Promise<{ success: boolean }> {
  return fetchAPI<{ success: boolean }>(API_ENDPOINTS.PATHS.TASKS.DELETE, {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  });
}

export async function getTaskById(id: string): Promise<Task> {
  return fetchAPI<Task>(`${API_ENDPOINTS.PATHS.TASKS.GET_BY_ID}/${id}`);
}

export async function updateTask(task: Task): Promise<Task> {
  return fetchAPI<Task>(API_ENDPOINTS.PATHS.TASKS.UPDATE, {
    method: 'PUT',
    body: JSON.stringify(task),
  });
}

// Products API
export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl?: string;
  details?: string;
  category?: string;
}

export async function getProducts(): Promise<Product[]> {
  return fetchAPI<Product[]>(API_ENDPOINTS.PATHS.ORDERS.GET_ALL);
}

export async function getProductById(id: string): Promise<Product> {
  return fetchAPI<Product>(`${API_ENDPOINTS.PATHS.ORDERS.GET_BY_ID}/${id}`);
}