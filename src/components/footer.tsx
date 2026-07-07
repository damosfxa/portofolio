"use client";

import { Mail, ArrowUp } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full border-t border-border bg-surface mt-12 py-12 px-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-lg font-black tracking-widest text-foreground">RR</span>
            <p className="text-sm text-text-muted">Fullstack Developer based in Indonesia.</p>
          </div>
          
          <div className="flex items-center gap-6 text-sm font-medium text-text-dim">
            <a href="#about" className="hover:text-foreground transition-colors">{t("nav.about")}</a>
            <a href="#skills" className="hover:text-foreground transition-colors">{t("nav.skills")}</a>
            <a href="#projects" className="hover:text-foreground transition-colors">{t("nav.projects")}</a>
            <a href="#contact" className="hover:text-foreground transition-colors">{t("nav.contact")}</a>
          </div>

          <div className="flex items-center gap-4">
            <a href="https://github.com/damosfxa" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-text-muted hover:bg-foreground hover:text-background transition-colors">
              <FaGithub className="w-4 h-4" />
            </a>
            <a href="mailto:ryzkirham@gmail.com" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-text-muted hover:bg-foreground hover:text-background transition-colors">
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-border text-xs text-text-subtle font-medium">
          <p>© {currentYear} RizkyRhamadani. {t("footer.rights")}</p>
          
          <button 
            onClick={scrollToTop}
            className="flex items-center gap-2 hover:text-foreground transition-colors"
          >
            <ArrowUp className="w-3 h-3" />
            Back to top
          </button>
        </div>

      </div>
    </footer>
  );
}
