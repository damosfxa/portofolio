"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Code, Award, Clock, User, ExternalLink, Quote, Calculator, Receipt, MessageSquareText, MessagesSquare, Bot, Menu, X, Sun } from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  // Di HP sidebar jadi laci yang dibuka dari bar atas; di layar lebar tetap menempel di kiri.
  const [open, setOpen] = useState(false);

  if (pathname === "/admin/login") return null;

  const handleLogout = () => {
    sessionStorage.removeItem("rr_admin_auth");
    router.push("/admin/login");
  };

  const navItems = [
    { label: "Hari Ini", path: "/admin/hari-ini", icon: <Sun className="w-4 h-4" /> },
    { label: "Projects", path: "/admin", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Skills", path: "/admin/skills", icon: <Code className="w-4 h-4" /> },
    { label: "Certificates", path: "/admin/certificates", icon: <Award className="w-4 h-4" /> },
    { label: "Timeline", path: "/admin/timeline", icon: <Clock className="w-4 h-4" /> },
    { label: "Testimoni", path: "/admin/testimonials", icon: <Quote className="w-4 h-4" /> },
    { label: "Agent Klien", path: "/admin/agent-klien", icon: <Bot className="w-4 h-4" /> },
    { label: "Balas Chat", path: "/admin/balas-chat", icon: <MessagesSquare className="w-4 h-4" /> },
    { label: "Kalkulator", path: "/admin/estimasi", icon: <Calculator className="w-4 h-4" /> },
    { label: "Invoice", path: "/admin/invoice", icon: <Receipt className="w-4 h-4" /> },
    { label: "Template Chat", path: "/admin/template-chat", icon: <MessageSquareText className="w-4 h-4" /> },
    { label: "Profile", path: "/admin/profile", icon: <User className="w-4 h-4" /> },
  ];

  const current = navItems.find((item) => item.path === pathname)?.label ?? "Admin";

  return (
    <>
      <header className="md:hidden fixed inset-x-0 top-0 z-40 h-14 flex items-center gap-3 px-4 border-b border-border bg-surface">
        <button onClick={() => setOpen(true)} aria-label="Buka menu" className="p-2 -ml-2 rounded-lg hover:bg-surface-hover">
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-bold tracking-tight">RR</span>
        <span className="text-sm text-text-muted truncate">{current}</span>
      </header>
      {open && <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />}
    <aside className={`w-64 border-r border-border bg-surface flex flex-col shrink-0 h-[100dvh] fixed inset-y-0 left-0 z-50 transition-transform md:sticky md:top-0 md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="p-6 border-b border-border flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">
          RR <span className="text-primary text-sm tracking-normal font-medium">Admin</span>
        </h1>
        <button onClick={() => setOpen(false)} aria-label="Tutup menu" className="md:hidden p-2 -mr-2 rounded-lg hover:bg-surface-hover">
          <X className="w-5 h-5" />
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setOpen(false)}
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
    </>
  );
}
