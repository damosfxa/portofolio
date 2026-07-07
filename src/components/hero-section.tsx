"use client";

import { motion } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

import { useLanguage } from "@/contexts/LanguageContext";
import { useLenis } from "lenis/react";

import { Magnetic } from "@/components/magnetic";

export function HeroSection({ profile }: { profile?: any }) {
  const { t, locale } = useLanguage();
  const lenis = useLenis();

  const currentTagline = locale === "en" ? (profile?.tagline_en || profile?.tagline) : profile?.tagline;
  const currentHeadline = locale === "en" ? (profile?.headline_en || profile?.headline) : profile?.headline;

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (lenis) {
      lenis.scrollTo(href);
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative min-h-[100dvh] flex items-center pt-24 pb-12 px-6 w-full">
      <div className="relative z-10 flex flex-col items-start gap-8 max-w-4xl mx-auto w-full">
        
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-text-subtle">
            {t("hero.greeting")}
          </p>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-8xl font-medium leading-[1.1] tracking-tight text-foreground"
        >
          {profile?.name || "Rizky Rhamadani"}
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl font-medium text-text-muted"
        >
          <span className="inline-flex animate-shimmer bg-[length:200%_100%] bg-clip-text text-transparent bg-[linear-gradient(110deg,#7c7c7c,45%,#0d0d0d,55%,#7c7c7c)] dark:bg-[linear-gradient(110deg,#6e6e6e,45%,#ededed,55%,#6e6e6e)]">{currentTagline || t("hero.role")}</span>
        </motion.p>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="text-sm md:text-base text-text-muted leading-relaxed max-w-xl h-[100px] md:h-[80px]"
        >
          {currentHeadline || t("hero.desc")}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          className="flex items-center gap-6 my-2"
        >
          <Magnetic strength={0.3}>
            <a href={profile?.github || "https://github.com/damosfxa"} target="_blank" rel="noopener noreferrer" className="p-2 -m-2 text-text-muted hover:text-foreground transition-colors">
              <FaGithub className="w-6 h-6" />
            </a>
          </Magnetic>
          <Magnetic strength={0.3}>
            <a href={profile?.email ? `mailto:${profile.email}` : "mailto:ryzkirham@gmail.com"} className="p-2 -m-2 text-text-muted hover:text-foreground transition-colors">
              <Mail className="w-6 h-6" />
            </a>
          </Magnetic>
          <Magnetic strength={0.3}>
            <a href="https://www.linkedin.com/in/rizky-rhamadani-/" target="_blank" rel="noopener noreferrer" className="p-2 -m-2 text-text-muted hover:text-foreground transition-colors">
              <FaLinkedin className="w-6 h-6" />
            </a>
          </Magnetic>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
          className="flex flex-wrap items-center gap-4 mt-2"
        >
          <Magnetic strength={0.15}>
            <a 
              href="#projects" 
              onClick={(e) => handleScrollTo(e, '#projects')}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-foreground text-background font-semibold text-sm hover:opacity-80 transition-opacity rounded-sm"
            >
              {t("nav.projects")} <ArrowRight className="w-4 h-4" />
            </a>
          </Magnetic>
          <Magnetic strength={0.15}>
            <a 
              href="#contact" 
              onClick={(e) => handleScrollTo(e, '#contact')}
              className="inline-flex items-center gap-2 px-8 py-3.5 border border-border text-foreground font-semibold text-sm hover:bg-surface transition-colors rounded-sm"
            >
              {t("nav.contact")} <Mail className="w-4 h-4" />
            </a>
          </Magnetic>
        </motion.div>

      </div>
    </section>
  );
}
