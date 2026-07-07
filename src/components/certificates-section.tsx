"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";

export function CertificatesSection() {
  const { t } = useLanguage();
  const [certData, setCertData] = useState<any[]>([]);

  useEffect(() => {
    const fetchCerts = async () => {
      const { data } = await supabase.from('certificates').select('*').order('sort', { ascending: true }).order('id', { ascending: false });
      if (data) setCertData(data);
    };
    fetchCerts();
  }, []);

  return (
    <section id="certificates" className="py-32 px-6 max-w-4xl mx-auto w-full scroll-mt-16">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 0.6 }}
        className="mb-12 h-[80px] md:h-[60px]"
      >
        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground">
          <span className="font-bold text-emerald-500">{t("certs.title")}</span> {t("certs.highlight")}
        </h2>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {certData.length > 0 ? (
          certData.map((cert) => (
            <div 
              key={cert.id} 
              className="group relative flex flex-col items-center overflow-hidden rounded-sm border border-border bg-surface text-text-muted hover:border-foreground transition-colors aspect-video md:aspect-[4/3] cursor-pointer"
            >
              {cert.image ? (
                <img src={cert.image} alt={cert.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 grayscale group-hover:grayscale-0" />
              ) : (
                <div className="flex w-full h-full items-center justify-center bg-surface-subtle">
                  <ImageIcon className="w-8 h-8 opacity-50" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <span className="text-foreground font-semibold text-sm">{cert.title}</span>
              </div>
            </div>
          ))
        ) : (
          [1, 2, 3].map((item) => (
            <div 
              key={item} 
              className="flex flex-col items-center justify-center gap-3 p-10 rounded-sm border border-dashed border-border bg-surface text-text-muted hover:border-foreground hover:bg-surface-hover transition-colors aspect-video md:aspect-[4/3]"
            >
              <ImageIcon className="w-8 h-8 opacity-50" />
              <span className="text-sm font-medium">{t("certs.empty")}</span>
            </div>
          ))
        )}
      </motion.div>
    </section>
  );
}
