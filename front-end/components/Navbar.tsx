import { useState } from "react";
import Close from "../public/close.svg";
import Menu from "../public/menu.svg";
import Logo from "../public/next.svg";
import Image from "next/image";

const Navbar = () => {
  const [toggle, setToggle] = useState(false);

  return (
    <nav className="fixed w-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md z-50">
      <div className="container mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <a
          href="/"
          className="flex items-center text-white font-bold text-xl"
        >
          <Image src={Logo} alt="Logo" height={35} width={40} />
        </a>

        {/* Desktop Menu */}
        <ul className="hidden sm:flex space-x-8 text-white">
          {/* Add your links here */}
          <li>
            <a href="/tasks" className="hover:text-gray-300">
              Tasks
            </a>
          </li>
          <li>
            <a href="/" className="hover:text-gray-300">
              Home
            </a>
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <div className="sm:hidden">
          <button
            onClick={() => setToggle(!toggle)}
            className="text-white focus:outline-none"
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
        <div className="sm:hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
          <ul className="space-y-4">
            {/* Add your mobile menu links here */}
            <li>
              <a href="/tasks" className="block hover:text-gray-300">
                Tasks
              </a>
            </li>
            <li>
              <a href="/" className="block hover:text-gray-300">
                Home
              </a>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
