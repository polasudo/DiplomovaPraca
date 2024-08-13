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
                <div className="text-white font-extrabold text-xl">Your Company</div>
                <div className="hidden md:flex space-x-6">
                    <a href="/" className="text-white hover:text-gray-300 transition-colors">
                        Home
                    </a>
                    <a href="/tasks" className="text-white hover:text-gray-300 transition-colors">
                        Tasks
                    </a>

                </div>
                <div className="md:hidden">
                    <button
                        onClick={toggleMenu}
                        className="text-white focus:outline-none"
                    >
                        <svg
                            className="w-6 h-6"
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
                <div className="md:hidden flex flex-col mt-4 space-y-4">
                    <a href="#home" className="text-white hover:text-gray-300 transition-colors">
                        Home
                    </a>
                    <a href="#features" className="text-white hover:text-gray-300 transition-colors">
                        Features
                    </a>
                    <a href="#about" className="text-white hover:text-gray-300 transition-colors">
                        About
                    </a>
                    <a href="#contact" className="text-white hover:text-gray-300 transition-colors">
                        Contact
                    </a>
                </div>
            )}
        </nav>
    )
}

export default Navbar