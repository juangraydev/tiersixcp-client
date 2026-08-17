'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/AppLogo';
import { UserRole } from '@/types/user';
import { themeConfig } from '@/config/theme';

interface SubMenuItem {
  label: string;
  href: string;
  minRole: UserRole;
}

interface MenuItem {
  label: string;
  minRole: UserRole;
  children: SubMenuItem[];
}

const MENU_ITEMS: MenuItem[] = [
  {
    label: 'Accounts',
    minRole: UserRole.NORMAL,
    children: [
      { label: 'Change Pin', href: '/account/change-pin', minRole: UserRole.NORMAL },
      { label: 'Change Password', href: '/account/change-password', minRole: UserRole.NORMAL },
      { label: 'Change Email', href: '/account/change-email', minRole: UserRole.NORMAL },
    ],
  },
  {
    label: 'Character',
    minRole: UserRole.NORMAL,
    children: [
      { label: 'Character History Logs', href: '/character/history-logs', minRole: UserRole.NORMAL },
      { label: 'Character Information Search', href: '/character/search-info', minRole: UserRole.NORMAL },
      { label: 'My Characters Search', href: '/character/my-characters', minRole: UserRole.NORMAL },
    ],
  },
  {
    label: 'Admin',
    minRole: UserRole.ADMIN,
    children: [
      { label: 'User Management', href: '/admin/users', minRole: UserRole.ADMIN },
      { label: 'System Logs', href: '/admin/logs', minRole: UserRole.ADMIN },
    ],
  },
  {
    label: 'Super Admin',
    minRole: UserRole.SUPER_ADMIN,
    children: [
      { label: 'Global Settings', href: '/super/settings', minRole: UserRole.SUPER_ADMIN },
      { label: 'Database Backup', href: '/super/backups', minRole: UserRole.SUPER_ADMIN },
    ],
  },
];

interface HeaderProps {
  userRole?: UserRole;
  onLogout?: () => void;
}

export default function Header({ userRole = UserRole.NORMAL, onLogout }: HeaderProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter top-level menus and submenus based on userRole
  const visibleMenuItems = MENU_ITEMS.filter((item) => userRole >= item.minRole)
    .map((item) => ({
      ...item,
      children: item.children.filter((subItem) => userRole >= subItem.minRole),
    }))
    .filter((item) => item.children.length > 0);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle API Logout Functionality
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      if (onLogout) {
        onLogout();
      }
      setIsMobileMenuOpen(false);
      setActiveDropdown(null);
      router.push('/');
      router.refresh();
    }
  };

  return (
    <header className={`sticky top-0 z-50 ${themeConfig.headerBg} border-b ${themeConfig.border}`}>
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        
        {/* Brand Logo & Desktop Dropdown Menus */}
        <div className="flex w-full items-center justify-center md:w-auto md:justify-start md:space-x-8" ref={dropdownRef}>
          {/* Logo Redirects to /dashboard */}
          <Link href="/dashboard" className="flex items-center">
            <AppLogo />
          </Link>

          {/* Desktop Navigation Dropdowns */}
          <nav className="hidden md:flex items-center space-x-6">
            {visibleMenuItems.map((menu) => (
              <div key={menu.label} className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setActiveDropdown(activeDropdown === menu.label ? null : menu.label)
                  }
                  className={`flex items-center space-x-1 text-sm font-medium ${themeConfig.textSecondary} transition-colors hover:text-white py-1`}
                >
                  <span>{menu.label}</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      activeDropdown === menu.label ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu Overlay */}
                {activeDropdown === menu.label && (
                  <div className="absolute left-0 mt-2 w-56 rounded-md border border-neutral-800 bg-neutral-950 p-2 shadow-xl z-50">
                    {menu.children.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        onClick={() => setActiveDropdown(null)}
                        className={`block px-3 py-2 text-sm rounded-md ${themeConfig.textSecondary} hover:bg-neutral-900 hover:text-white transition-colors`}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Desktop Logout Button */}
        <div className="hidden md:flex items-center">
          <button
            onClick={handleLogout}
            className={`flex items-center space-x-2 text-sm font-medium text-neutral-300 ${themeConfig.primaryHover} transition-colors px-3 py-1.5 rounded-md border ${themeConfig.border} bg-neutral-900/60`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.75}
              stroke="currentColor"
              className="w-4 h-4 text-red-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25"
              />
            </svg>
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className={`absolute right-6 md:hidden p-2 rounded-md border ${themeConfig.border} bg-neutral-900/60 text-neutral-300 hover:text-white`}
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className={`md:hidden border-b ${themeConfig.border} bg-neutral-950 px-6 py-4 space-y-4`}>
          <nav className="flex flex-col space-y-3">
            {visibleMenuItems.map((menu) => (
              <div key={menu.label} className="space-y-1">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  {menu.label}
                </span>
                <div className="pl-2 flex flex-col space-y-1 border-l border-neutral-800">
                  {menu.children.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`text-sm font-medium ${themeConfig.textSecondary} hover:text-white py-1`}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="pt-3 border-t border-neutral-800">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center justify-center space-x-2 text-sm font-medium text-neutral-300 ${themeConfig.primaryHover} transition-colors px-3 py-2 rounded-md border ${themeConfig.border} bg-neutral-900/60`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.75}
                stroke="currentColor"
                className="w-4 h-4 text-red-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25"
                />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}