"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Akses ditolak: Email atau password salah.");
      setLoading(false);
      return;
    }

    sessionStorage.setItem("rr_admin_auth", "true");
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Subtle Glow Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d4af37]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-xs relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-serif font-bold text-[#F4F4F0] mb-2 tracking-tight">Admin Portal</h1>
          <p className="text-[#F4F4F0]/40 text-xs tracking-[0.2em] uppercase">Restricted Area</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest text-[#F4F4F0]/50 uppercase">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-[#F4F4F0]/20 pb-2 pt-1 text-[#F4F4F0] text-sm placeholder:text-[#F4F4F0]/20 focus:outline-none focus:border-[#d4af37] transition-colors"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest text-[#F4F4F0]/50 uppercase">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-[#F4F4F0]/20 pb-2 pt-1 text-[#F4F4F0] text-sm placeholder:text-[#F4F4F0]/20 focus:outline-none focus:border-[#d4af37] transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-10 py-3 bg-[#F4F4F0] text-[#09090B] text-xs font-bold tracking-widest uppercase hover:bg-[#d4af37] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
