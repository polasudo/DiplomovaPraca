'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../../components/Navbar';
import { getAnalyticsData, AnalyticsData } from '../../api/analyticsService';

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await getAnalyticsData();
        setAnalyticsData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [isAuthenticated, router]);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-24">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics Dashboard</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        ) : analyticsData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Summary Cards */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.totalOrders}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${analyticsData.totalRevenue.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avg. Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">${analyticsData.averageOrderValue.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            {/* Top Products */}
            <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {analyticsData.topProducts.map((product, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{product.quantity}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">${product.revenue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Orders by Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h2>
              <div className="space-y-4">
                {analyticsData.ordersByStatus.map((statusData, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full" 
                        style={{ width: `${(statusData.count / analyticsData.totalOrders) * 100}%` }}
                      ></div>
                    </div>
                    <div className="ml-4 min-w-[100px]">
                      <p className="text-sm font-medium text-gray-900">{statusData.status}</p>
                      <p className="text-sm text-gray-500">{statusData.count}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Revenue by Period */}
            <div className="bg-white rounded-lg shadow p-6 md:col-span-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Period</h2>
              <div className="h-64 flex items-end space-x-2">
                {analyticsData.revenueByPeriod.map((periodData, index) => {
                  const maxRevenue = Math.max(...analyticsData.revenueByPeriod.map(p => p.revenue));
                  const height = (periodData.revenue / maxRevenue) * 100;
                  
                  return (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div 
                        className="w-full bg-indigo-500 rounded-t" 
                        style={{ height: `${height}%` }}
                      ></div>
                      <p className="text-xs text-gray-500 mt-2">{periodData.period}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}