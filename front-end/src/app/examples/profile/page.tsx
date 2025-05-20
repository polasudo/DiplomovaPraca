'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAwsAuth } from '../../../contexts/AwsAuthContext';
import { useOrders, useAnalytics } from '../../../hooks/useAwsHooks';
import Navbar from '../../../../components/Navbar';

const ProfilePage = () => {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, logout } = useAwsAuth();
  const { orders, loading: ordersLoading, getOrders } = useOrders();
  const { analytics, loading: analyticsLoading, getAnalytics } = useAnalytics();
  const [activeTab, setActiveTab] = useState('profile');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/examples/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch orders and analytics when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (activeTab === 'orders') {
        getOrders(user.userId);
      } else if (activeTab === 'analytics') {
        getAnalytics();
      }
    }
  }, [isAuthenticated, user, activeTab, getOrders, getAnalytics]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Format date string
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (authLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 py-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 py-10">
        <div className="container mx-auto px-4 pt-16">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Profile Header */}
            <div className="bg-indigo-700 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div className="flex items-center mb-4 sm:mb-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-300 rounded-full flex items-center justify-center text-indigo-700 text-2xl sm:text-3xl font-bold mr-4">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">{user?.firstName} {user?.lastName}</h1>
                    <p className="text-indigo-200">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors shadow-md"
                >
                  Logout
                </button>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm sm:text-base ${activeTab === 'profile' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm sm:text-base ${activeTab === 'orders' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Orders
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm sm:text-base ${activeTab === 'analytics' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Analytics
                </button>
              </nav>
            </div>
            
            {/* Tab Content */}
            <div className="p-6 sm:p-8">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Account Information</h2>
                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <p className="text-sm text-gray-500">First Name</p>
                        <p className="text-base sm:text-lg font-medium">{user?.firstName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Last Name</p>
                        <p className="text-base sm:text-lg font-medium">{user?.lastName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-base sm:text-lg font-medium">{user?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="text-base sm:text-lg font-medium">{user?.phoneNumber || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Implementation Details</h2>
                    <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                      <p className="text-gray-700 mb-2">
                        This profile page demonstrates how to use the AWS Cognito authentication service to display user information.
                        It uses the <code className="bg-gray-100 px-1 py-0.5 rounded">useAwsAuth</code> hook to access the authenticated user's data.
                      </p>
                      <p className="text-gray-700">
                        The page is protected and requires authentication. If a user is not logged in, they will be redirected to the login page.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Your Orders</h2>
                  
                  {ordersLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : orders && orders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Order ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {orders.map((order) => (
                            <tr key={order.orderId} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                                {order.orderId.substring(0, 8)}...
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                  {order.status || 'processing'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ${(order.totalAmount || order.orderTotal || 0).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                      You don't have any orders yet.
                    </div>
                  )}
                  
                  <div className="mt-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Implementation Details</h2>
                    <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                      <p className="text-gray-700 mb-2">
                        This tab demonstrates how to use the <code className="bg-gray-100 px-1 py-0.5 rounded">useOrders</code> hook 
                        to fetch and display orders for the authenticated user.
                      </p>
                      <p className="text-gray-700">
                        The implementation includes loading states and conditional rendering based on the data received from the API.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Analytics</h2>
                  
                  {analyticsLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : analytics ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-indigo-50 p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-indigo-600 font-medium">Total Users</p>
                        <p className="text-2xl font-bold text-indigo-900">{analytics.userCount || 0}</p>
                      </div>
                      <div className="bg-indigo-50 p-4 rounded-lg shadow-sm">
                        <p className="text-sm text-indigo-600 font-medium">Total Orders</p>
                        <p className="text-2xl font-bold text-indigo-900">{analytics.orderCount || 0}</p>
                      </div>
                      
                      {analytics.popularProducts && (
                        <div className="col-span-1 md:col-span-3 mt-4">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">Popular Products</h3>
                          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Product
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Orders
                                  </th>
                                </tr>
                              </thead>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                      No analytics data available.
                    </div>
                  )}
                  
                  <div className="mt-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Implementation Details</h2>
                    <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                      <p className="text-gray-700 mb-2">
                        This tab demonstrates how to use the <code className="bg-gray-100 px-1 py-0.5 rounded">useAnalytics</code> hook 
                        to fetch and display analytics data from the AWS backend.
                      </p>
                      <p className="text-gray-700">
                        The implementation includes loading states and conditional rendering based on the data received from the API.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;