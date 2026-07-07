"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

import { Magnetic } from "@/components/magnetic";

export function AboutSection({ profile }: { profile?: any }) {
  const { t, locale } = useLanguage();

  const currentTagline = locale === "en" ? (profile?.tagline_en || profile?.tagline) : profile?.tagline;
  const currentBio = locale === "en" ? (profile?.bio_en || profile?.bio) : profile?.bio;
  const currentVision = locale === "en" ? (profile?.vision_en || profile?.vision) : profile?.vision;

  return (
    <section id="about" className="py-32 px-6 max-w-4xl mx-auto w-full scroll-mt-16">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl flex flex-col gap-8"
      >
        <div className="flex flex-col gap-2 text-2xl md:text-4xl font-medium tracking-tight leading-tight text-foreground h-[80px] md:h-[100px]">
          <h2>
            {t("hero.greeting")} <span className="font-bold text-blue-500">{profile?.name || "Rizky Rhamadani"}</span>,
          </h2>
          <h3 className="text-text-muted">
            {currentTagline || t("hero.role")}
          </h3>
        </div>

        <div className="w-8 h-[2px] bg-foreground"></div>

        <div className="flex flex-col gap-6 text-text-muted text-base md:text-lg leading-relaxed md:h-auto min-h-[120px]">
          <p>
            {currentBio || t("about.desc")}
          </p>
          {currentVision && (
            <p className="mt-2 text-sm md:text-base border-l-2 border-foreground pl-4 text-foreground/80 italic font-medium">
              "{currentVision}"
            </p>
          )}
        </div>

        <div>
          <Magnetic strength={0.15}>
            <a 
              href="/assets/cv-rizkyrhamadani.pdf" 
              download 
              className="inline-flex items-center gap-2.5 px-8 py-3.5 border border-border bg-foreground text-background font-semibold text-sm transition-opacity hover:opacity-80 rounded-sm"
            >
              <Download className="w-4 h-4" />
              {t("about.downloadCv")}
            </a>
          </Magnetic>
        </div>
      </motion.div>
    </section>
  );
}
