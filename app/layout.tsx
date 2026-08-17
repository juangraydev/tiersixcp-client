import type { Metadata } from 'next';
import LayoutWrapper from '@/components/LayoutWrapper';
import { UserRole } from '@/types/user';
import './globals.css';

const appName = process.env.NEXT_PUBLIC_APP_NAME || 'MyApp';

export const metadata: Metadata = {
  title: {
    template: `${appName} | %s`, // Results in "MyApp | Dashboard"
    default: appName,            // Default tab title when no page sub-title is set
  },
  description: 'Role-based application template',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUserRole: UserRole = UserRole.ADMIN;

  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white antialiased">
        <LayoutWrapper userRole={currentUserRole}>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}