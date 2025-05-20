'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
// Adjust these import paths to your project structure
import { useAwsAuth } from '../../../contexts/AwsAuthContext'; 
import { useOrders } from '../../../hooks/useAwsHooks';
import Navbar from '../../../../components/Navbar';

// Define clear types for what the backend expects
interface BackendOrderItem {
  productId: string;
  name: string; // Assuming backend expects/can store name
  quantity: number;
  price: number; // Backend expects price
}

interface ShippingAddress {
  street: string;
  city: string;
  zipCode: string;
  country: string;
}

// This is the payload structure your CreateOrder Lambda expects
export interface CreateOrderPayload {
  userId: string;
  items: BackendOrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod?: string;
  notes?: string;
}

// This is what an Order object looks like, matching your Lambda's output
interface Order {
  orderId: string;
  userId: string;
  items: BackendOrderItem[]; // Should use BackendOrderItem
  orderTotal: number; // Matched to backend response
  status: string;
  createdAt: string | number; // Backend might send timestamp or ISO string
  updatedAt?: string | number;
  paymentMethod?: string;
  shippingAddress?: ShippingAddress;
}

// This is what your UI collects for each item to be added
interface NewOrderItemUI {
  productId: string;
  quantity: number;
  // You might want to add fields for name and price here if user inputs them
  // or if you fetch them after productId is entered.
}


const OrdersPage = () => {
  const router = useRouter();
  // Ensure 'user' from useAwsAuth contains 'userId' (which should be the Cognito 'sub')
  const { isAuthenticated, user, loading: authLoading } = useAwsAuth(); 
  const { 
    orders, 
    loading: ordersLoading, 
    error: ordersError, 
    getOrders, 
    createOrder // This function is from your useOrders hook
  } = useOrders();

  const [newOrderItems, setNewOrderItems] = useState<NewOrderItemUI[]>([]);
  const [currentProductId, setCurrentProductId] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState(1);
  
  // State for shipping address - in a real app, this would come from form inputs
  const [shippingInfo, setShippingInfo] = useState<ShippingAddress>({
    street: '123 Web St',
    city: 'ClientCity',
    zipCode: '90210',
    country: 'US',
  });

  const [createOrderLoading, setCreateOrderLoading] = useState(false);
  const [createOrderError, setCreateOrderError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth loading to finish before redirecting
    if (!authLoading && !isAuthenticated) {
      router.push('/examples/login'); // Adjust your login path
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user?.userId) {
      getOrders(user.userId);
    }
  }, [isAuthenticated, user, getOrders]); // getOrders should be stable or wrapped in useCallback

  const handleAddItem = () => {
    if (!currentProductId.trim() || currentQuantity < 1) {
      alert('Please enter a valid Product ID and quantity.');
      return;
    }
    setNewOrderItems(prev => [...prev, { productId: currentProductId.trim(), quantity: currentQuantity }]);
    setCurrentProductId('');
    setCurrentQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setNewOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateOrder = async () => {
    if (newOrderItems.length === 0) {
      setCreateOrderError('Please add items to your order.');
      return;
    }
    if (!user?.userId) {
      setCreateOrderError('User not authenticated or user ID is missing. Please log in again.');
      return;
    }
    // Ensure all shipping fields are filled (basic validation)
    if (!shippingInfo.street || !shippingInfo.city || !shippingInfo.zipCode || !shippingInfo.country) {
        setCreateOrderError('Please fill in all shipping address fields.');
        return;
    }

    setCreateOrderLoading(true);
    setCreateOrderError(null);

    // --- CRITICAL: Augment items with price and name ---
    // In a real application, you would fetch product details (name, price)
    // from your backend/database based on the productId when items are added to the cart.
    // For this example, we'll use placeholder values.
    const itemsForBackend: BackendOrderItem[] = newOrderItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: parseFloat((Math.random() * 50 + 5).toFixed(2)), // ** REPLACE WITH ACTUAL PRICE LOGIC **
      name: `Product ${item.productId}`, // ** REPLACE WITH ACTUAL NAME LOGIC **
    }));

    const orderPayload: CreateOrderPayload = {
      userId: user.userId,
      items: itemsForBackend,
      shippingAddress: shippingInfo,
      // You can add these if your form supports them and backend handles them
      // paymentMethod: 'CardOnWeb', 
      // notes: 'Please handle with care.'
    };

    try {
      console.log('Frontend: Submitting order payload:', JSON.stringify(orderPayload, null, 2));
      // The `createOrder` function from your `useOrders` hook should internally call
      // the `createNewOrder` function in `awsService.ts` which makes the API call.
      // Ensure that `awsService.ts` correctly sets the Authorization header.
      await createOrder(orderPayload); 
      
      setNewOrderItems([]); // Clear items from the UI form
      // Optionally clear shipping form or product ID/quantity fields here
      alert('Order created successfully!');
      if (user?.userId) {
        getOrders(user.userId); // Refresh the list of orders
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setCreateOrderError(`Failed to create order: ${errorMessage}`);
      console.error('Frontend: Error creating order:', err);
    } finally {
      setCreateOrderLoading(false);
    }
  };

  const formatDate = (dateInput: string | number | Date) => {
    // Handle potential epoch timestamps (if numbers) or date strings
    const date = typeof dateInput === 'number' ? new Date(dateInput * 1000) : new Date(dateInput);
    return date.toLocaleString();
  };
  
  // Render loading state from useAuth hook
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
        <p className="ml-4 text-gray-700">Authenticating...</p>
      </div>
    );
  }
  
  // If not authenticated (and auth is no longer loading), this component might not render due to redirect.
  // But adding a guard here in case the redirect hasn't happened yet.
  if (!isAuthenticated) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-xl text-gray-700">Redirecting to login...</p>
        </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 py-10">
        <div className="container mx-auto px-4 pt-16">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">My Orders</h1>
          
          {/* Create New Order Section */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Order</h2>
            
            {createOrderError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{createOrderError}</span>
              </div>
            )}

            {/* Shipping Address Form Fields */}
            <fieldset className="mb-6 border p-4 rounded-md">
                <legend className="text-lg font-medium text-gray-700 px-2">Shipping Address</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                        <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                        <input type="text" id="street" value={shippingInfo.street} onChange={(e) => setShippingInfo(s => ({...s, street: e.target.value}))} className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input type="text" id="city" value={shippingInfo.city} onChange={(e) => setShippingInfo(s => ({...s, city: e.target.value}))} className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                        <input type="text" id="zipCode" value={shippingInfo.zipCode} onChange={(e) => setShippingInfo(s => ({...s, zipCode: e.target.value}))} className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        <input type="text" id="country" value={shippingInfo.country} onChange={(e) => setShippingInfo(s => ({...s, country: e.target.value}))} className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                </div>
            </fieldset>
            
            {/* Add Item Form */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Add Items to Order</h3>
              <div className="flex flex-col md:flex-row gap-4 mb-4 items-end">
                <div className="flex-grow">
                  <label htmlFor="currentProductId" className="block text-sm font-medium text-gray-700 mb-1">Product ID</label>
                  <input id="currentProductId" type="text" value={currentProductId} onChange={(e) => setCurrentProductId(e.target.value)} className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Enter product ID"/>
                </div>
                <div className="w-full md:w-32">
                  <label htmlFor="currentQuantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input id="currentQuantity" type="number" min="1" value={currentQuantity} onChange={(e) => setCurrentQuantity(Math.max(1, parseInt(e.target.value)))} className="text-black w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                </div>
                <div>
                  <button onClick={handleAddItem} disabled={!currentProductId.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                    Add Item
                  </button>
                </div>
              </div>
              
              {/* Items List */}
              {newOrderItems.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Current Order Items</h3>
                  <div className="bg-gray-50 rounded-md p-4">
                    <ul className="divide-y divide-gray-200">
                      {newOrderItems.map((item, index) => (
                        <li key={index} className="py-3 flex justify-between items-center">
                          <div>
                            <span className="text-gray-800">Product ID: {item.productId}</span>
                            <span className="ml-4 text-gray-600">Quantity: {item.quantity}</span>
                          </div>
                          <button onClick={() => handleRemoveItem(index)} className="text-red-600 hover:text-red-800">Remove</button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              <div className="mt-6">
                <button onClick={handleCreateOrder} disabled={newOrderItems.length === 0 || createOrderLoading} className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                  {createOrderLoading ? 'Creating Order...' : 'Create Order'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Orders List Section (Existing) */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Order History</h2>
            {ordersLoading && ( /* Using ordersLoading from useOrders hook */
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            )}
            {ordersError && ( /* Using ordersError from useOrders hook */
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{ordersError.message}</span>
              </div>
            )}
            {!ordersLoading && !ordersError && orders.length === 0 && (
              <div className="text-center py-8 text-gray-500">You don't have any orders yet.</div>
            )}
            {!ordersLoading && !ordersError && orders.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  {/* Table Head */}
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    </tr>
                  </thead>
                  {/* Table Body */}
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.orderId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                            {order.orderId.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'COMPLETED' || order.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {order.status}
                          </span>
                        </td>
                        {/* Ensure your Order interface and backend actually provide orderTotal */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.orderTotal?.toFixed(2) || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrdersPage;