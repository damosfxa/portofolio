"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";

// Penanda login hanya untuk tampilan admin; keamanan data yang sebenarnya dijaga RLS di Supabase.
const noSubscribe = () => () => {};
const readAuth = () => sessionStorage.getItem("rr_admin_auth") === "true";
const serverAuth = () => null;

export function AdminAuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  // null saat render di server (sessionStorage belum ada), true/false setelah di browser.
  const isAuth = useSyncExternalStore(noSubscribe, readAuth, serverAuth);
  const onLogin = pathname === "/admin/login";
  const redirectTo = isAuth === null ? null : !isAuth && !onLogin ? "/admin/login" : isAuth && onLogin ? "/admin" : null;

  useEffect(() => {
    if (redirectTo) router.push(redirectTo);
  }, [redirectTo, router]);

  if (isAuth === null || redirectTo) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
}
