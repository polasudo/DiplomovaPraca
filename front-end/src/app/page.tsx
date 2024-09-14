'use client'
import React from "react";
import { useState } from "react";
import Close from "../../public/close.svg";
import Menu from "../../public/menu.svg";
import Logo from "../../public/next.svg";
import Image from "next/image";
import Navbar from "../../components/Navbar";


export default function Home() {
  // const [toggle, setToggle] = useState(false);
  return (
    <main className="flex flex-col items-center justify-between min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        {/* Hero Section */}
        <div
          className="relative w-full h-[80vh] flex flex-col items-center justify-center text-center bg-cover bg-center bg-no-repeat shadow-lg"
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="z-10 max-w-3xl mx-auto">
            <h1 className="text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
              Welcome to Our Awesome Platform
            </h1>
            <p className="text-lg text-gray-200 mb-8 max-w-lg mx-auto">
              Streamline your workflow with our powerful task manager.
            </p>
            <a
              href="#features"
              className="inline-block bg-indigo-600 text-white py-3 px-8 text-lg rounded-full shadow-md hover:bg-indigo-500 transition-all duration-300"
            >
              Get Started
            </a>
          </div>
        </div>

        {/* Feature Section */}
        <section id="features" className="w-full py-16 px-6 bg-white shadow-md mt-12 rounded-xl max-w-6xl mx-auto mb-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-indigo-800">Features</h2>
            <p className="text-gray-600 mt-4">Explore the powerful tools we offer to enhance your productivity.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-blue-50 p-6 rounded-lg text-center shadow-md hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-2xl font-semibold text-indigo-800 mb-2">Easy Task Management</h3>
              <p className="text-gray-600">Organize, prioritize, and manage your tasks effortlessly.</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg text-center shadow-md hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-2xl font-semibold text-indigo-800 mb-2">Real-Time Collaboration</h3>
              <p className="text-gray-600">Work together with your team in real-time from anywhere.</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg text-center shadow-md hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-2xl font-semibold text-indigo-800 mb-2">Loreim Ipsum</h3>
              <p className="text-gray-600">Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
            </div>
          </div>
        </section>

        {/* Footer Section */}
        <footer className="w-full py-6 bg-indigo-800 text-white text-center mt-auto">
          <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
        </footer>
      </main>
  );
}
