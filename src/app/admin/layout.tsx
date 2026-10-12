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
        <main className="flex-1 min-w-0 overflow-y-auto bg-background pt-14 md:pt-0">
          {children}
        </main>
      </div>
    </AdminAuthWrapper>
  );
}
