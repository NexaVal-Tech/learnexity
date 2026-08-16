// Components/admin/sidebar.tsx

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  Home,
  GraduationCap, 
  BookCopy, 
  Calendar, 
  BarChart3, 
  SlidersHorizontal, 
  User, 
  LogOut,
  ChevronsUpDown,
  Component,
  Award,
  FileBadge,
  FolderTree,
} from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import ThemeToggle from '@/components/theme/ThemeToggle';

const Sidebar = () => {
  const router = useRouter();
  const { logout } = useAdminAuth();

  const menuItems = [
    { icon: Home, label: 'Dashboard Overview', href: '/admin/dashboard' },
    { icon: User, label: 'Instructors Management', href: '/admin/instructors' },
    { icon: GraduationCap, label: 'Students Management', href: '/admin/students' },
    { icon: BookCopy, label: 'Course Management', href: '/admin/courses' },
    { icon: FolderTree, label: 'Course Groups', href: '/admin/course-groups' },
    { icon: Calendar, label: 'Consultations', href: '/admin/consultation' },
    { icon: SlidersHorizontal, label: 'Course Settings', href: '/admin/settings/courses' },
    { icon: GraduationCap, label: 'Kids Management', href: '/admin/kids' },
    { icon: User, label: 'Referral History', href: '/admin/referral-history' },
    { icon: GraduationCap, label: 'Scholarship Applications', href: '/admin/scholarship-application' },
    { icon: Award, label: 'Badges', href: '/admin/badges' },
    { icon: FileBadge, label: 'Certificates', href: '/admin/certificates' },
    { icon: BarChart3, label: 'Analytics & Reports', href: '/admin/analytics' },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/admin/auth/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-74 bg-white dark:bg-[#0f0f14] border-r border-gray-100 dark:border-white/10 flex flex-col z-50">
      {/* Header / Team Switcher */}
      <div className="p-4 border-b border-gray-100 dark:border-white/10">
        <div className="flex items-center justify-between gap-2 px-2 py-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg cursor-pointer transition-colors group">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center">
                     <img src="/images/Logo.png" alt="Learnexity" className="h-8 w-8 object-contain" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900 dark:text-white leading-none">Learnexity</span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-1">mary@gmail.com</span>
                </div>
            </div>
            <ChevronsUpDown size={14} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-4 px-2">Main</div>
        {menuItems.map((item) => {
          const isActive = router.pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'} />
              {item.label}
            </Link>
          );
        })}

        <div className="mt-8 border-t border-gray-100 dark:border-white/10 pt-4 space-y-1">
            <Link
              href="/admin/profile"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                router.pathname === '/admin/profile'
                  ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <User size={20} className={router.pathname === '/admin/profile' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'} />
              Admin Profile
            </Link>
            <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
                <LogOut size={20} className="text-gray-500 dark:text-gray-400" />
                Logout
            </button>
            <div className="flex items-center justify-between px-3 py-2.5">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Theme</span>
              <ThemeToggle />
            </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
