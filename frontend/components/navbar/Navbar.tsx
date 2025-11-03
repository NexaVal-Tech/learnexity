"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext"; // ✅ import your auth context hook

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth(); // ✅ get logged-in user

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/courses/courses", label: "Courses" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact Us" },
    { href: "/community", label: "Join our community" },
  ];

  return (
    <>
      <nav className="bg-white shadow-sm fixed w-full z-50">
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img src="/images/Logo.png" alt="Learnexity logo" />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center hover:text-[#6C63FF] ${
                    isActive ? "text-gray-900 font-bold" : "text-gray-900"
                  }`}
                >
                  {isActive && (
                    <span className="w-2 h-2 bg-gray-900 rounded-full mr-2 transition-all duration-300 ease-in-out"></span>
                  )}
                  {item.label}
                </Link>
              );
            })}

            {/* ✅ Conditionally show Dashboard if logged in */}
            {user && (
              <Link
                href="/user/dashboard"
                className={`flex items-center text-gray-900 border-2 border-blue-600 rounded-2xl p-2 hover:text-[#6C63FF] ${
                  pathname === "/dashboard" ? "font-bold" : ""
                }`}
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Desktop CTA Button */}
          <Link
            href="/consultation"
            className="hidden md:block bg-[#6C63FF] text-white px-6 py-3 rounded-full font-medium hover:bg-[#5753E6] transition-colors"
          >
            Book a free consultation
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <div className="flex flex-col justify-center items-center w-6 h-6">
              <span
                className={`bg-gray-900 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                  isMenuOpen ? "rotate-45 translate-y-1" : "-translate-y-0.5"
                }`}
              ></span>
              <span
                className={`bg-gray-900 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${
                  isMenuOpen ? "opacity-0" : "opacity-100"
                }`}
              ></span>
              <span
                className={`bg-gray-900 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                  isMenuOpen ? "-rotate-45 -translate-y-1" : "translate-y-0.5"
                }`}
              ></span>
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed bg-black bg-opacity-50 z-40 transition-opacity duration-300 md:hidden ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={closeMenu}
      ></div>

      {/* Mobile Dropdown Menu */}
      <div
        className={`fixed top-0 left-0 w-full bg-white z-50 shadow-lg transform transition-all duration-300 ease-in-out md:hidden overflow-hidden ${
          isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        {/* Menu Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <Link href="/" className="flex items-center space-x-2" onClick={closeMenu}>
            <img src="/images/Logo.png" alt="Learnexity logo" />
          </Link>
          <button
            onClick={closeMenu}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-900 transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col px-6 py-6 space-y-5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center text-lg transition-colors ${
                  isActive
                    ? "text-gray-900 font-bold"
                    : "text-gray-900 hover:text-[#6C63FF]"
                }`}
                onClick={closeMenu}
              >
                {isActive && (
                  <span className="w-2 h-2 bg-gray-900 rounded-full mr-3"></span>
                )}
                {item.label}
              </Link>
            );
          })}

          {/* ✅ Mobile Dashboard link (only if logged in) */}
          {user && (
            <Link
              href="/user/dashboard"
              className={`flex items-center text-lg text-gray-900 border-2 border-blue-600 rounded-2xl p-2 w-50 justify-center hover:text-[#6C63FF] ${
                pathname === "/dashboard" ? "font-bold" : ""
              }`}
              onClick={closeMenu}
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Mobile CTA Button */}
        <div className="px-6 pb-6">
          <Link
            href="/consultation"
            className="block w-full bg-[#6C63FF] text-white px-6 py-3 rounded-full font-medium hover:bg-[#5753E6] transition-colors text-center"
            onClick={closeMenu}
          >
            Book a free consultation
          </Link>
        </div>
      </div>
    </>
  );
}
