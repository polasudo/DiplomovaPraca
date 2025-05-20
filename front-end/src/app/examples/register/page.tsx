'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAwsAuth } from '../../../contexts/AwsAuthContext';
import Navbar from '../../../../components/Navbar';

const RegisterPage = () => {
  const router = useRouter();
  const { register, error, loading, isAuthenticated } = useAwsAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: ''
  });
  const [registerError, setRegisterError] = useState<string | null>(null);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/examples/orders');
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setRegisterError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setRegisterError('Password must be at least 8 characters long');
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber
      });
      
      // Redirect to login page after successful registration
      router.push('/examples/login?registered=true');
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
      console.error('Registration error:', err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 py-10">
        <div className="container mx-auto px-4 pt-16">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden md:max-w-2xl p-8">
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Create an Account</h1>
            
            {registerError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{registerError}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="+1234567890"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters long</p>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/examples/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Login here
                </a>
              </p>
            </div>
          </div>
          
          <div className="mt-8 max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden md:max-w-2xl p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Implementation Details</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-700">
                This registration form demonstrates integration with AWS Cognito for user registration. 
                It collects all required fields for the AWS backend (email, password, firstName, lastName, phoneNumber) 
                and performs basic validation before submitting.
              </p>
              <p className="text-sm text-gray-700 mt-2">
                After successful registration, users are redirected to the login page where they can sign in 
                with their new credentials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;