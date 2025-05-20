'use client';

import { useState, useEffect } from "react";
import Close from "../public/close.svg";
import Menu from "../public/menu.svg";
import Logo from "../public/next.svg";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../src/contexts/AuthContext";

const Navbar = () => {
  const [toggle, setToggle] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  
  // Add scroll event listener to change navbar appearance on scroll
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black shadow-lg' : 'bg-black'}`}>
      <div className="hidden md:container md:mx-auto md:flex md:justify-between md:items-center py-4 px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center text-white font-bold text-xl"
        >
          <Image src={Logo} alt="Logo" height={35} width={40} className="mr-2" />
          <span className="hidden md:block">TaskFlow</span>
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-8 text-white font-medium">
          <li>
            <Link href="/" className="hover:text-gray-300 py-2 px-3 rounded-md hover:bg-gray-800 transition-colors">
              Home
            </Link>
          </li>
          <li>
            <Link href="/products" className="hover:text-gray-300 py-2 px-3 rounded-md hover:bg-gray-800 transition-colors">
              Products
            </Link>
          </li>
          <li>
            <Link href="/orders" className="hover:text-gray-300 py-2 px-3 rounded-md hover:bg-gray-800 transition-colors">
              Orders
            </Link>
          </li>
          {isAuthenticated ? (
            <>
              <li>
                <Link href="/profile" className="hover:text-gray-300 py-2 px-3 rounded-md hover:bg-gray-800 transition-colors">
                  Profile
                </Link>
              </li>
              <li>
                <button 
                  onClick={logout} 
                  className="hover:text-gray-300 py-2 px-3 rounded-md hover:bg-gray-800 transition-colors"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href="/login" className="bg-white text-black hover:bg-gray-200 py-2 px-4 rounded-md transition-colors font-medium">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="bg-gray-800 text-white hover:bg-gray-700 py-2 px-4 rounded-md transition-colors">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Mobile Menu Button */}
        <div className=" md:hidden">
          <button
            onClick={() => setToggle(!toggle)}
            className="text-white focus:outline-none p-2 rounded-md hover:bg-gray-800 transition-colors"
            aria-label={toggle ? "Close menu" : "Open menu"}
          >
            <Image
              src={toggle ? Close : Menu}
              alt="Menu Icon"
              height={28}
              width={28}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {toggle && (
        <div className="md:hidden bg-black text-white p-6 shadow-lg">
          <ul className="space-y-4 font-medium">
            <li>
              <Link href="/" className="block py-2 px-3 rounded-md hover:bg-gray-800 hover:text-gray-300 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/products" className="block py-2 px-3 rounded-md hover:bg-gray-800 hover:text-gray-300 transition-colors">
                Products
              </Link>
            </li>
            <li>
              <Link href="/orders" className="block py-2 px-3 rounded-md hover:bg-gray-800 hover:text-gray-300 transition-colors">
                Orders
              </Link>
            </li>
            {isAuthenticated ? (
              <>
                <li>
                  <Link href="/profile" className="block py-2 px-3 rounded-md hover:bg-gray-800 hover:text-gray-300 transition-colors">
                    Profile
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={logout} 
                    className="block w-full text-left py-2 px-3 rounded-md hover:bg-gray-800 hover:text-gray-300 transition-colors"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="mt-6">
                  <Link href="/login" className="block w-full bg-white text-black hover:bg-gray-200 py-2 px-4 rounded-md transition-colors font-medium text-center">
                    Login
                  </Link>
                </li>
                <li className="mt-3">
                  <Link href="/register" className="block w-full bg-gray-800 text-white hover:bg-gray-700 py-2 px-4 rounded-md transition-colors text-center">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
