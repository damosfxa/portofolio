"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export function AdminAuthWrapper({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isAuth = sessionStorage.getItem("rr_admin_auth") === "true";
    if (!isAuth && pathname !== "/admin/login") {
      router.push("/admin/login");
    } else if (isAuth && pathname === "/admin/login") {
      router.push("/admin");
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, router]);

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
}
