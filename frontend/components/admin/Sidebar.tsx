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
  ChevronsUpDown
} from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const Sidebar = () => {
  const router = useRouter();
  const { logout } = useAdminAuth();

  const menuItems = [
    { icon: Home, label: 'Dashboard Overview', href: '/admin/dashboard' },
    { icon: GraduationCap, label: 'Students Management', href: '/admin/students' },
    { icon: BookCopy, label: 'Course Management', href: '/admin/courses' },
    { icon: Calendar, label: 'Consultations', href: '/admin/consultations' },
    { icon: BarChart3, label: 'Analytics & Reports', href: '/admin/analytics' },
    { icon: SlidersHorizontal, label: 'Settings', href: '/admin/settings' },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/admin/auth/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-50">
      {/* Header / Team Switcher */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between gap-2 px-2 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center">
                     <img src="/images/Logo.png" alt="Learnexity" className="h-8 w-8 object-contain" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900 leading-none">Learnexity</span>
                    <span className="text-[11px] text-gray-500 font-medium mt-1">mary@gmail.com</span>
                </div>
            </div>
            <ChevronsUpDown size={14} className="text-gray-400 group-hover:text-gray-600" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <div className="text-xs font-semibold text-gray-400 uppercase mb-4 px-2">Main</div>
        {menuItems.map((item) => {
          const isActive = router.pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-gray-900' : 'text-gray-500'} />
              {item.label}
            </Link>
          );
        })}
        
        <div className="mt-8 border-t border-gray-100 pt-4">
            <Link
              href="/admin/profile"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                router.pathname === '/admin/profile'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <User size={20} className={router.pathname === '/admin/profile' ? 'text-gray-900' : 'text-gray-500'} />
              Admin Profile
            </Link>
            <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
                <LogOut size={20} className="text-gray-500" />
                Logout
            </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
