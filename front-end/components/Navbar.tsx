'use client'
import React, { useState } from 'react'

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="w-full bg-indigo-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div className="text-white font-extrabold text-2xl">Your Company</div>
                <div className="hidden md:flex space-x-8">
                    <a href="/" className="text-white hover:text-gray-300 transition-colors duration-300">
                        Home
                    </a>
                    <a href="/tasks" className="text-white hover:text-gray-300 transition-colors duration-300">
                        Tasks
                    </a>
                </div>
                <div className="md:hidden">
                    <button
                        onClick={toggleMenu}
                        className="text-white focus:outline-none"
                        aria-label="Toggle navigation"
                    >
                        <svg
                            className="w-8 h-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                            />
                        </svg>
                    </button>
                </div>
            </div>
            {isOpen && (
                <div className="md:hidden flex flex-col mt-4 space-y-2 bg-indigo-700 p-4 rounded-lg shadow-lg">
                    <a href="/" className="text-white hover:text-gray-300 transition-colors duration-300">
                        Home
                    </a>
                    <a href="/tasks" className="text-white hover:text-gray-300 transition-colors duration-300">
                        Tasks
                    </a>
                </div>
            )}
        </nav>
    )
}

export default Navbar
