"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";

const TECH_ICONS: Record<string, string> = {
  'Laravel':      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg',
  'ReactJS':      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg',
  'React':        'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg',
  'Tailwind CSS': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg',
  'MySQL':        'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg',
  'PostgreSQL':   'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg',
  'Next.js':      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg',
  'TypeScript':   'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg',
  'PHP':          'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/php/php-original.svg',
  'Bootstrap':    'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/bootstrap/bootstrap-original.svg',
  'HTML':         'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg',
  'HTML5':        'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg',
  'CSS':          'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg',
  'JS':           'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg',
  'JavaScript':   'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg',
  'Git':          'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg',
  'WordPress':    'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/wordpress/wordpress-plain.svg',
  'Figma':        'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg',
};

export function SkillsSection() {
  const { t } = useLanguage();
  const [skillsRow1, setSkillsRow1] = useState<any[]>([]);
  const [skillsRow2, setSkillsRow2] = useState<any[]>([]);

  useEffect(() => {
    const fetchSkills = async () => {
      const { data } = await supabase.from('skills').select('*').order('sort', { ascending: true });
      if (data) {
        // Split data into two rows
        const mid = Math.ceil(data.length / 2);
        setSkillsRow1(data.slice(0, mid).map(s => ({ name: s.name, icon: TECH_ICONS[s.name] || TECH_ICONS['JS'] })));
        setSkillsRow2(data.slice(mid).map(s => ({ name: s.name, icon: TECH_ICONS[s.name] || TECH_ICONS['JS'] })));
      }
    };
    fetchSkills();
  }, []);
  return (
    <section id="skills" className="py-32 px-6 max-w-4xl mx-auto w-full scroll-mt-16">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 0.6 }}
        className="mb-14 h-[80px] md:h-[60px]"
      >
        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground">
          {t("skills.title")} <span className="font-bold text-pink-500">{t("skills.highlight")}</span>
        </h2>
      </motion.div>

      <div className="flex flex-col gap-8 overflow-hidden relative py-4" style={{ transform: "translateZ(0)", willChange: "transform", WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent)' }}>
        
        {/* Row 1 */}
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          {[...skillsRow1, ...skillsRow1, ...skillsRow1].map((skill, i) => (
            <div key={i} className="flex items-center gap-3 px-6 py-3.5 mx-3 rounded-sm border border-border bg-surface transition-all duration-300 hover:border-foreground hover:-translate-y-1 z-10 hover:z-20 cursor-default group">
              <img src={skill.icon} alt={skill.name} className="w-6 h-6 object-contain grayscale group-hover:grayscale-0 transition-all duration-300" loading="lazy" />
              <span className="font-medium text-text-muted group-hover:text-foreground transition-colors">{skill.name}</span>
            </div>
          ))}
        </div>

        {/* Row 2 */}
        <div className="flex w-max animate-marquee-reverse hover:[animation-play-state:paused]">
          {[...skillsRow2, ...skillsRow2, ...skillsRow2].map((skill, i) => (
            <div key={i} className="flex items-center gap-3 px-6 py-3.5 mx-3 rounded-sm border border-border bg-surface transition-all duration-300 hover:border-foreground hover:-translate-y-1 z-10 hover:z-20 cursor-default group">
              <img src={skill.icon} alt={skill.name} className="w-6 h-6 object-contain grayscale group-hover:grayscale-0 transition-all duration-300" loading="lazy" />
              <span className="font-medium text-text-muted group-hover:text-foreground transition-colors">{skill.name}</span>
            </div>
          ))}
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-100% / 3)); }
        }
        @keyframes marquee-reverse {
          from { transform: translateX(calc(-100% / 3)); }
          to { transform: translateX(0); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 35s linear infinite;
        }
      `}} />
    </section>
  );
}
