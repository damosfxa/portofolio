"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu, X, Sparkles, User, Home, Briefcase, Mail, Award, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

import { Magnetic } from "@/components/magnetic";

import { useLenis } from "lenis/react";

const navLinks = [
  { name: "nav.home", fallback: "Home", href: "#hero", icon: Home, bg: "bg-zinc-500", text: "text-zinc-500" },
  { name: "nav.about", fallback: "About", href: "#about", icon: User, bg: "bg-blue-500", text: "text-blue-500" },
  { name: "nav.skills", fallback: "Skills", href: "#skills", icon: Sparkles, bg: "bg-pink-500", text: "text-pink-500" },
  { name: "nav.projects", fallback: "Work", href: "#projects", icon: Briefcase, bg: "bg-orange-500", text: "text-orange-500" },
  { name: "nav.certificates", fallback: "Certificates", href: "#certificates", icon: Award, bg: "bg-emerald-500", text: "text-emerald-500" },
  { name: "nav.contact", fallback: "Contact", href: "#contact", icon: Mail, bg: "bg-violet-500", text: "text-violet-500" },
];

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lenis = useLenis();

  const navRef = React.useRef<HTMLElement>(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0, bg: "bg-primary" });

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      
      const sections = navLinks.map((link) => link.href.substring(1));
      let current = "hero";
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && window.scrollY >= element.offsetTop - 150) {
          current = section;
        }
      }
      setActiveSection(current);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mounted || !navRef.current) return;
    
    // Give DOM a tick to update widths after language change
    const updatePill = () => {
      const activeEl = navRef.current?.querySelector('.active-nav-link') as HTMLElement;
      if (activeEl) {
        setPillStyle({
          left: activeEl.offsetLeft,
          width: activeEl.offsetWidth,
          opacity: 1,
          bg: activeEl.getAttribute('data-bg') || "bg-primary"
        });
      } else {
        setPillStyle(prev => ({ ...prev, opacity: 0 }));
      }
    };

    updatePill();
    // setTimeout ensures the font/text render has updated the element's width
    const timeout = setTimeout(updatePill, 50);
    return () => clearTimeout(timeout);
  }, [activeSection, locale, mounted]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (lenis) {
      lenis.scrollTo(href);
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  if (!mounted) return null;

  return (
    <>
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
        <header
          className={`pointer-events-auto flex items-center justify-between gap-6 px-4 md:px-6 h-14 rounded-full border backdrop-blur-md transition-colors duration-300 w-[95%] max-w-[860px]
            ${scrolled ? "bg-surface/90 border-border-hover shadow-lg" : "bg-surface/60 border-border"}
          `}
        >
          <div className="flex-shrink-0">
            <Magnetic strength={0.2}>
              <a href="#hero" onClick={(e) => handleNavClick(e, "#hero")} className="text-sm font-bold tracking-widest text-foreground hover:opacity-80 transition-opacity">
                RR
              </a>
            </Magnetic>
          </div>

          {/* Desktop Nav */}
          <nav ref={navRef} className="hidden md:flex items-center gap-1 relative z-0">
            {/* The sliding pill */}
            <div
              className={`absolute top-1.5 bottom-1.5 -z-10 rounded-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${pillStyle.bg}`}
              style={{
                left: `${pillStyle.left}px`,
                width: `${pillStyle.width}px`,
                opacity: pillStyle.opacity,
              }}
            />

            {navLinks.map((link) => {
              const isActive = activeSection === link.href.substring(1);
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`relative flex items-center gap-2 px-3 py-1.5 text-[13.5px] font-medium transition-colors rounded-full group ${isActive ? 'active-nav-link' : ''} ${
                    isActive ? "text-white" : "text-text-dim hover:text-foreground"
                  }`}
                  data-bg={link.bg}
                >
                  <link.icon className={`w-3.5 h-3.5 transition-colors ${isActive ? "text-white" : "group-hover:" + link.text}`} />
                  <span>{t(link.name) || link.fallback}</span>
                </a>
              );
            })}
          </nav>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <Magnetic strength={0.2}>
            <button
              onClick={() => setLocale(locale === "id" ? "en" : "id")}
              className="flex items-center justify-center gap-1.5 w-[64px] h-[32px] rounded-full text-xs font-bold text-text-muted hover:text-foreground transition-colors uppercase"
              aria-label="Toggle language"
            >
              <Globe className="w-3.5 h-3.5" />
              {locale}
            </button>
          </Magnetic>
          
          <div className="w-px h-4 bg-border hidden md:block mx-1"></div>

          <Magnetic strength={0.2}>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-foreground transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </Magnetic>
          
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-foreground hover:bg-muted pointer-events-auto"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        </header>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-4 top-20 z-40 p-4 rounded-xl border border-border bg-surface shadow-xl md:hidden flex flex-col gap-2"
          >
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.substring(1);
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                    isActive ? "bg-foreground text-background" : "text-foreground hover:bg-muted"
                  }`}
                >
                  <link.icon className={`w-4 h-4 ${isActive ? "text-background" : ""}`} />
                  {t(link.name) || link.fallback}
                </a>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
