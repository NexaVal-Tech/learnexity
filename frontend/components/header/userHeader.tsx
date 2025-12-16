"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext"; // 👈 Import useAuth

export default function UserHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth(); // 👈 Use the AuthContext

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleAccount = () => {
    setIsAccountOpen(!isAccountOpen);
  };

  const handleLogout = async () => {
    try {
      await logout(); // 👈 Use logout from AuthContext
      // No need to manually remove token or redirect - logout() handles it
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if logout fails, the AuthContext will clear the state
    }
  };

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/user/dashboard", label: "Dashboard" }, // 👈 Fixed href
    { href: "/user/resource", label: "Resource" }, // 👈 Fixed href
    { href: "/user/referrals", label: "Referrals" }, // 👈 Fixed href
    { href: "https://calendly.com/nexavaltech/30min", label: "Free Consultation" },
    { href: "/community", label: "Join our community" },
  ];

  // 👇 Add this to get user initials
  const getUserInitials = () => {
    if (!user?.name) return "?";
    const names = user.name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name[0].toUpperCase();
  };

  return (
    <>
      <nav className="bg-white shadow-sm fixed w-full z-50">
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img src="/images/Logo.png" alt="Learnexity logo" className="h-8" />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`flex items-center hover:text-[#6C63FF] text-sm ${
                    isActive ? "text-gray-900 font-semibold" : "text-gray-700"
                  }`}
                >
                  {isActive && (
                    <span className="w-2 h-2 bg-[#6C63FF] rounded-full mr-2"></span>
                  )}
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Upgrade Button */}
            <Link 
              href="/upgrade" 
              className="bg-[#6C63FF] text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-[#5753E6] transition-colors"
            >
              Upgrade
            </Link>

            {/* Notification Icon */}
            <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-5 h-5 text-gray-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Account Dropdown */}
            <div className="relative">
              <button 
                onClick={toggleAccount} 
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center border-3 border-blue-500">
                  <span className="text-gray-700 font-semibold text-sm">
                    {getUserInitials()} {/* 👈 Show user initials */}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>

              {/* Dropdown Menu */}
              {isAccountOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsAccountOpen(false)}></div>
                  <div className="absolute right-0 mt-5 w-55 bg-white rounded-lg shadow-xl border border-gray-200 py-4 z-20">
                    {/* 👇 Show user info */}
                    {user && (
                      <>
                        <div className="px-4 py-2 border-b">
                          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </>
                    )}
                    <Link href="/user/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsAccountOpen(false)}>
                      Profile
                    </Link>
                    <Link href="/user/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsAccountOpen(false)}>
                      Settings
                    </Link>
                    <hr className="my-2" />
                    <button onClick={handleLogout} className="block w-40 mx-auto text-center px-4 py-1 p-4 text-xl text-red-600 hover:bg-gray-100 border-2 rounded-3xl" >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={toggleMenu} className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors" aria-label="Toggle menu">
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
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 md:hidden ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={closeMenu}
      ></div>

      {/* Mobile Dropdown Menu */}
      <div className={`fixed top-0 left-0 w-full bg-white z-50 shadow-lg transform transition-all duration-300 ease-in-out md:hidden overflow-hidden ${
          isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        {/* Menu Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <Link href="/" className="flex items-center space-x-2" onClick={closeMenu}>
            <img src="/images/Logo.png" alt="Learnexity logo" className="h-8" />
          </Link>
          <button 
            onClick={closeMenu} 
            className="p-2 rounded-md hover:bg-gray-100 text-gray-900 transition-colors" 
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
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
                  isActive ? "text-gray-900 font-bold" : "text-gray-900 hover:text-[#6C63FF]"
                }`}
                onClick={closeMenu}
              >
                {isActive && (
                  <span className="w-2 h-2 bg-[#6C63FF] rounded-full mr-3"></span>
                )}
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile Bottom Section */}
        <div className="px-6 pb-6 space-y-4">
          {/* Upgrade Button */}
          <Link href="/upgrade" className="block w-full bg-[#6C63FF] text-white px-6 py-3 rounded-full font-medium hover:bg-[#5753E6] transition-colors text-center"  onClick={closeMenu}>
            Upgrade
          </Link>

          {/* Account & Notifications */}
          <div className="flex items-center justify-between pt-4 border-t">
            <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-5 h-5 text-gray-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center border-2 border-blue-900">
                <span className="text-gray-700 font-semibold text-sm">
                  {getUserInitials()} {/* 👈 Show user initials */}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {user?.name || "Account"} {/* 👈 Show user name */}
              </span>
            </div>
          </div>

          {/* 👇 Add logout button for mobile */}
          <button onClick={handleLogout} className="block w-full text-center px-4 py-2 text-xl text-red-600 hover:bg-gray-100 border-2 rounded-3xl" >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}