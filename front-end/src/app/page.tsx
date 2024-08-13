'use client'
import React, { useState } from "react";
import Image from "next/image";
import Navbar from "../../components/Navbar";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-100 p-8">
      <Navbar />

      {/* Hero Section */}
      <div
        className="relative w-full h-[60vh] flex flex-col items-center justify-center text-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl font-extrabold text-white mb-6">Welcome to Our Awesome Platform</h1>
          <p className="text-lg text-gray-200 mb-8">Task Manager.</p>
          <a
            href="#features"
            className="inline-block bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-500 transition-colors duration-300"
          >
            Get Started
          </a>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="w-full py-8 bg-indigo-800 text-white text-center">
        <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
      </footer>
    </main>
  );
}
