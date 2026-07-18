"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Code, Award, Clock, User, ExternalLink } from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") return null;

  const handleLogout = () => {
    sessionStorage.removeItem("rr_admin_auth");
    router.push("/admin/login");
  };

  const navItems = [
    { label: "Projects", path: "/admin", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Skills", path: "/admin/skills", icon: <Code className="w-4 h-4" /> },
    { label: "Certificates", path: "/admin/certificates", icon: <Award className="w-4 h-4" /> },
    { label: "Timeline", path: "/admin/timeline", icon: <Clock className="w-4 h-4" /> },
    { label: "Profile", path: "/admin/profile", icon: <User className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 border-r border-border bg-surface flex flex-col shrink-0 sticky top-0 h-[100dvh]">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold tracking-tight">
          RR <span className="text-primary text-sm tracking-normal font-medium">Admin</span>
        </h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                isActive
                  ? "bg-foreground text-background shadow-md"
                  : "text-text-muted hover:bg-surface-hover hover:text-foreground"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border flex flex-col gap-2">
        <a
          href="/"
          target="_blank"
          className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-text-muted hover:text-foreground transition-colors"
        >
          Lihat Website <ExternalLink className="w-4 h-4" />
        </a>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl font-medium text-sm bg-surface-subtle border border-border text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
