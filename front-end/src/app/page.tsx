'use client'
import React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "../../components/Navbar";
import { useAuth } from "../contexts/AuthContext";
import Link from "next/link";
import { checkApiHealth } from "../api/apiService";


export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [apiStatus, setApiStatus] = useState<'loading' | 'connected' | 'error'>('loading');

  // Real API connection check using centralized API service
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        await checkApiHealth();
        setApiStatus('connected');
      } catch (error) {
        setApiStatus('error');
        console.error('API connection error:', error);
      }
    };

    checkApiConnection();
  }, []);

  return (
    <main className="flex flex-col items-center justify-between min-h-screen">
        <Navbar />
        {/* Hero Section */}
        <div
          className="relative w-full h-[70vh] sm:h-[80vh] md:h-[90vh] flex flex-col items-center justify-center text-center bg-cover bg-center bg-no-repeat shadow-xl mt-16"
          style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')" }}
        >
          <div className="z-10 w-full max-w-4xl mx-auto px-4 sm:px-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold text-white mb-4 sm:mb-6 drop-shadow-lg leading-tight">
              Welcome to Our <span className="text-indigo-400">Awesome</span> Platform
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
              Streamline your workflow with our powerful task manager and boost your productivity.
            </p>
            <a
              href="#features"
              className="inline-block bg-indigo-600 text-white py-3 px-6 sm:py-4 sm:px-10 text-base sm:text-lg font-medium rounded-lg shadow-lg hover:bg-indigo-500 transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </a>
          </div>
        </div>

        {/* API Connection Status */}
        <section className="w-full py-8 sm:py-10 md:py-12 px-4 sm:px-6 bg-white shadow-lg mt-8 sm:mt-12 md:mt-16 rounded-xl max-w-6xl mx-auto border border-gray-100">
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-indigo-900 mb-2 sm:mb-3">Backend Connection Status</h2>
            <p className="text-gray-700 text-base sm:text-lg">This application is connected to a serverless AWS backend</p>
          </div>
          
          <div className="flex justify-center items-center mb-6 sm:mb-8 md:mb-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center bg-gray-50 px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 rounded-lg shadow-md border border-gray-200 w-full max-w-md">
              <div className="mb-3 sm:mb-0 sm:mr-5 self-center sm:self-auto">
                <div className={`h-5 w-5 sm:h-6 sm:w-6 rounded-full ${apiStatus === 'loading' ? 'bg-yellow-400 animate-pulse' : apiStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'} shadow-sm`}></div>
              </div>
              <div>
                <p className="font-semibold text-base sm:text-lg text-gray-900 text-center sm:text-left">
                  API Status: {apiStatus === 'loading' ? 'Connecting...' : apiStatus === 'connected' ? 'Connected' : 'Connection Error'}
                </p>
                <p className="text-gray-600 mt-1 text-sm sm:text-base text-center sm:text-left">
                  {apiStatus === 'connected' ? 'Successfully connected to backend services' : apiStatus === 'loading' ? 'Establishing connection to backend services' : 'Failed to connect to backend services'}
                </p>
              </div>
            </div>
          </div>

          {isAuthenticated ? (
            <div className="text-center bg-indigo-100 p-4 sm:p-6 md:p-8 rounded-lg mb-6 sm:mb-8 shadow-inner border border-indigo-200">
              <h3 className="text-xl sm:text-2xl font-bold text-indigo-900 mb-2 sm:mb-3">Welcome back, {user?.firstName}!</h3>
              <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg">You're logged in and can access all features of the application.</p>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                <Link href="/profile" className="px-4 sm:px-6 py-2 sm:py-3 bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 transition-colors shadow-md font-medium text-sm sm:text-base">
                  View Profile
                </Link>
                <Link href="/orders" className="px-4 sm:px-6 py-2 sm:py-3 bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 transition-colors shadow-md font-medium text-sm sm:text-base">
                  My Orders
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center bg-gradient-to-r from-indigo-50 to-purple-50 p-4 sm:p-6 md:p-8 rounded-lg mb-6 sm:mb-8 shadow-md border border-indigo-100">
              <h3 className="text-xl sm:text-2xl font-bold text-indigo-900 mb-2 sm:mb-3">Get Started</h3>
              <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg">Sign in or create an account to access all features.</p>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                <Link href="/login" className="px-4 sm:px-6 py-2 sm:py-3 bg-indigo-700 text-white rounded-lg hover:bg-indigo-600 transition-colors shadow-md font-medium text-sm sm:text-base">
                  Login
                </Link>
                <Link href="/register" className="px-4 sm:px-6 py-2 sm:py-3 bg-white text-indigo-700 rounded-lg hover:bg-gray-50 transition-colors shadow-md border-2 border-indigo-700 font-medium text-sm sm:text-base">
                  Register
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Feature Section */}
        <section id="features" className="w-full py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gradient-to-r from-indigo-900 to-purple-900 shadow-lg mt-8 sm:mt-12 md:mt-16 rounded-xl max-w-6xl mx-auto mb-8 sm:mb-12 md:mb-16 text-white">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 sm:mb-4">Features</h2>
            <p className="text-base sm:text-lg md:text-xl text-indigo-100 mt-2 sm:mt-4 max-w-2xl mx-auto">Explore the powerful tools we offer to enhance your productivity.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            <div className="bg-white/10 backdrop-blur-sm p-5 sm:p-6 md:p-8 rounded-xl text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 border border-indigo-500/30">
              <div className="bg-indigo-600 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto rounded-full flex items-center justify-center mb-4 sm:mb-5 md:mb-6 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 md:mb-4">Easy Task Management</h3>
              <p className="text-indigo-100 text-sm sm:text-base">Organize, prioritize, and manage your tasks effortlessly with our intuitive interface.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-5 sm:p-6 md:p-8 rounded-xl text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 border border-indigo-500/30">
              <div className="bg-indigo-600 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto rounded-full flex items-center justify-center mb-4 sm:mb-5 md:mb-6 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 md:mb-4">Real-Time Collaboration</h3>
              <p className="text-indigo-100 text-sm sm:text-base">Work together with your team in real-time from anywhere in the world.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-5 sm:p-6 md:p-8 rounded-xl text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 border border-indigo-500/30">
              <div className="bg-indigo-600 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto rounded-full flex items-center justify-center mb-4 sm:mb-5 md:mb-6 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 md:mb-4">Productivity Boost</h3>
              <p className="text-indigo-100 text-sm sm:text-base">Enhance your workflow efficiency and accomplish more in less time.</p>
            </div>
          </div>
        </section>

        {/* Footer Section */}
        <footer className="w-full py-6 sm:py-8 bg-indigo-950 text-white text-center mt-auto">
          <div className="container mx-auto px-4">
            <p className="text-base sm:text-lg">&copy; {new Date().getFullYear()} TaskFlow. All rights reserved.</p>
            <div className="mt-3 sm:mt-4 flex justify-center space-x-4 sm:space-x-6">
              <a href="#" className="text-sm sm:text-base text-indigo-300 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-sm sm:text-base text-indigo-300 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-sm sm:text-base text-indigo-300 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </main>
  );
}
