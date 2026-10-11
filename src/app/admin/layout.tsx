import { Metadata } from 'next';

import { AdminAuthWrapper } from '@/components/admin/AdminAuthWrapper';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthWrapper>
      <div className="min-h-[100dvh] bg-background text-foreground flex">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </AdminAuthWrapper>
  );
}
