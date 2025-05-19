'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import Navbar from '../../../../components/Navbar';
import { createOrder, CreateOrderRequest } from '../../../api/orderService';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}

// Sample products (in a real app, these would come from an API)
const SAMPLE_PRODUCTS: Product[] = [
  { id: 'prod1', name: 'Product 1', price: 19.99, description: 'This is product 1' },
  { id: 'prod2', name: 'Product 2', price: 29.99, description: 'This is product 2' },
  { id: 'prod3', name: 'Product 3', price: 39.99, description: 'This is product 3' },
  { id: 'prod4', name: 'Product 4', price: 49.99, description: 'This is product 4' },
];

export default function CreateOrderPage() {
  const [selectedProducts, setSelectedProducts] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity < 0) return;
    
    setSelectedProducts(prev => {
      if (quantity === 0) {
        const newSelected = {...prev};
        delete newSelected[productId];
        return newSelected;
      }
      return {
        ...prev,
        [productId]: quantity
      };
    });
  };

  const calculateTotal = () => {
    return Object.entries(selectedProducts).reduce((total, [productId, quantity]) => {
      const product = SAMPLE_PRODUCTS.find(p => p.id === productId);
      return total + (product ? product.price * quantity : 0);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (Object.keys(selectedProducts).length === 0) {
      setError('Please select at least one product');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const orderData: CreateOrderRequest = {
        products: Object.entries(selectedProducts).map(([productId, quantity]) => {
          return {
            productId,
            quantity
          };
        })
      };
      
      await createOrder(orderData);
      router.push('/orders');
    } catch (err) {
      console.error('Failed to create order:', err);
      setError('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-24">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Order</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Products</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {SAMPLE_PRODUCTS.map((product) => (
                <div key={product.id} className="border rounded-lg p-4 flex flex-col">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <p className="text-gray-500 text-sm">{product.description}</p>
                    <p className="text-gray-900 font-medium mt-2">${product.price.toFixed(2)}</p>
                  </div>
                  
                  <div className="mt-4 flex items-center">
                    <button 
                      type="button"
                      className="bg-gray-200 text-gray-700 rounded-l-md px-3 py-1"
                      onClick={() => handleQuantityChange(product.id, (selectedProducts[product.id] || 0) - 1)}
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      min="0"
                      value={selectedProducts[product.id] || 0}
                      onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 0)}
                      className="w-12 text-center border-t border-b py-1"
                    />
                    <button 
                      type="button"
                      className="bg-gray-200 text-gray-700 rounded-r-md px-3 py-1"
                      onClick={() => handleQuantityChange(product.id, (selectedProducts[product.id] || 0) + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between items-center text-lg font-medium">
              <span>Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.push('/orders')}
              className="mr-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || Object.keys(selectedProducts).length === 0}
              className={`px-4 py-2 rounded-md text-white ${loading || Object.keys(selectedProducts).length === 0 ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} transition-colors`}
            >
              {loading ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}