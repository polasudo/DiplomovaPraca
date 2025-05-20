'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAwsAuth } from '../../../contexts/AwsAuthContext';
import Navbar from '../../../../components/Navbar';

const LoginPage = () => {
  const router = useRouter();
  const { login, error, loading, isAuthenticated } = useAwsAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/examples/orders');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    try {
      await login({ email, password });
      router.push('/examples/orders');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed. Please try again.');
      console.error('Login error:', err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 py-10">
        <div className="container mx-auto px-4 pt-16">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden md:max-w-2xl p-8">
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Login to Your Account</h1>
            
            {loginError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{loginError}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="/examples/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Register here
                </a>
              </p>
            </div>
          </div>
          
          <div className="mt-8 max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden md:max-w-2xl p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Example Credentials</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-700 mb-2"><strong>Email:</strong> test@example.com</p>
              <p className="text-sm text-gray-700"><strong>Password:</strong> Password123!</p>
              <p className="text-xs text-gray-500 mt-2 italic">Note: These are example credentials and won't actually work with the AWS backend.</p>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Implementation Details</h3>
              <p className="text-sm text-gray-600">
                This login page demonstrates integration with AWS Cognito for authentication. 
                It uses the <code className="bg-gray-100 px-1 py-0.5 rounded">useAwsAuth</code> hook 
                which manages the authentication state and provides login functionality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;