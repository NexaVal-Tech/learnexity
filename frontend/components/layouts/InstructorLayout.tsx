// components/layouts/InstructorLayout.tsx

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useInstructorAuth } from '@/contexts/InstructorAuthContext';
import {
  BookCopy, Home, LogOut, Menu, X, User, ChevronDown, FolderKanban,
} from 'lucide-react';

interface InstructorLayoutProps { children: React.ReactNode }

export default function InstructorLayout({ children }: InstructorLayoutProps) {
  const { instructor, logout } = useInstructorAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { icon: Home,        label: 'Dashboard',         href: '/instructors/dashboard' },
    { icon: BookCopy,    label: 'My Courses',         href: '/instructors/courses' },
    { icon: FolderKanban,label: 'Projects',           href: '/instructors/projects' },
    { icon: User,        label: 'Profile',            href: '/instructors/profile' },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/instructors/auth/login');
  };

  const SidebarContent = () => (
    <aside className="flex flex-col h-full bg-white border-r border-gray-100">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 flex items-center justify-center">
            <img src="/images/Logo.png" alt="Learnexity" className="h-8 w-8 object-contain" />
          </div>
          <div>
            <span className="text-sm font-bold text-gray-900 leading-none block">Learnexity</span>
            <span className="text-[11px] text-indigo-600 font-semibold mt-0.5 block">Instructor Portal</span>
          </div>
        </div>
      </div>

      {/* Instructor info */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
            {instructor?.name?.charAt(0).toUpperCase() ?? 'I'}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-none">{instructor?.name}</p>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[150px]">{instructor?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-5 px-4 space-y-1">
        <p className="text-xs font-semibold text-gray-400 uppercase px-2 mb-3">Navigation</p>
        {navItems.map((item) => {
          const isActive = router.pathname === item.href || router.pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon size={18} className={isActive ? 'text-indigo-600' : 'text-gray-400'} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} className="text-gray-400" />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:w-64 md:block z-40">
        <SidebarContent />
      </div>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/images/Logo.png" alt="Learnexity" className="h-7" />
          <span className="text-xs font-semibold text-indigo-600">Instructor</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="md:pl-64 pt-16 md:pt-0 min-h-screen">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}