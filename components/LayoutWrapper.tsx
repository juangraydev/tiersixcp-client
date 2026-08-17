'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import { themeConfig } from '@/config/theme';

interface LayoutWrapperProps {
  children: React.ReactNode;
  userRole?: number;
}

const HEADER_ALLOWED_ROUTES = [
  '/dashboard',
  '/character',
  '/profile',
  '/admin',
  '/super',
];

export default function LayoutWrapper({ children, userRole }: LayoutWrapperProps) {
  const pathname = usePathname();
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'MyApp';

  const showHeader = HEADER_ALLOWED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  return (
    <div className={`flex min-h-screen flex-col ${themeConfig.bodyBg} ${themeConfig.textPrimary} antialiased`}>
      {showHeader && <Header userRole={userRole} />}

      <main className="flex-1 flex flex-col justify-center mx-auto w-full max-w-7xl px-6 py-8">
        {children}
      </main>

      <footer className={`border-t ${themeConfig.border} ${themeConfig.footerBg} py-5 text-center text-sm ${themeConfig.textMuted}`}>
        © {new Date().getFullYear()} <span className="font-semibold text-red-500">{appName}</span>. All rights reserved.
      </footer>
    </div>
  );
}