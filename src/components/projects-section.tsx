"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TiltCard } from "./tilt-card";
import { supabase } from "@/lib/supabase";
import { X, ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { useLanguage } from "@/contexts/LanguageContext";

const TECH_ICONS: Record<string, string> = {
  'Laravel':      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg',
  'ReactJS':      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg',
  'React':        'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg',
  'Tailwind CSS': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg',
  'MySQL':        'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg',
  'PostgreSQL':   'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg',
  'Next.js':      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg',
  'Nextjs':       'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg',
  'TypeScript':   'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg',
  'Typescript':   'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg',
  'PHP':          'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/php/php-original.svg',
  'Bootstrap':    'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/bootstrap/bootstrap-original.svg',
  'HTML':         'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg',
  'HTML5':        'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg',
  'CSS':          'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg',
  'CSS3':         'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg',
  'JS':           'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg',
  'JavaScript':   'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg',
  'Git':          'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg',
  'WordPress':    'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/wordpress/wordpress-plain.svg',
  'Figma':        'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg',
};

type Project = any;

export function ProjectsSection() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectsData, setProjectsData] = useState<Project[]>([]);
  
  const filters = ["all", "Web App", "UI Design", "Landing Page"];
  
  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase.from('projects').select('*').order('sort', { ascending: true }).order('id', { ascending: false });
      if (data) setProjectsData(data);
    };
    fetchProjects();
  }, []);

  const filteredProjects = projectsData.filter(
    (p) => filter === "all" || p.category === filter
  );

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedProject]);

  return (
    <section id="projects" className="py-32 px-6 max-w-4xl mx-auto w-full scroll-mt-16">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12"
      >
        <div className="h-[100px] md:h-[120px]">
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground">
            {t("projects.title")} <span className="font-bold text-orange-500">{t("projects.highlight")}</span>
          </h2>
          <p className="text-sm text-text-muted mt-3 max-w-md">
            {t("projects.desc")}
          </p>
        </div>
        <div className="text-[11px] text-text-subtle tracking-wider pt-2 font-medium">
          {projectsData.length} PROJECTS
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex flex-wrap gap-2 mb-10"
      >
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-sm text-xs font-medium border transition-all duration-300 ${
              filter === f 
                ? "bg-foreground text-background border-foreground shadow-sm" 
                : "bg-transparent text-text-muted border-border hover:border-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? t("projects.all") : f}
          </button>
        ))}
      </motion.div>

      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project) => (
            <TiltCard
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className="group flex flex-col rounded-sm border border-border bg-surface overflow-hidden hover:border-foreground transition-all duration-300 cursor-pointer"
            >
              <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                <img
                  src={project.thumbnail?.startsWith("http") ? project.thumbnail : "/" + project.thumbnail}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <motion.span 
                    initial={{ y: 10, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    className="text-xs font-bold tracking-widest text-background px-6 py-2.5 rounded-sm bg-foreground shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
                  >
                    VIEW PROJECT
                  </motion.span>
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <span className="text-[11px] font-bold text-text-subtle uppercase tracking-widest mb-2">
                  {project.category}
                </span>
                <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:underline decoration-2 underline-offset-4">
                  {project.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed line-clamp-2 mb-4 flex-1">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border mt-auto">
                  {project.tags.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-surface-subtle text-text-dim rounded-sm border border-border group-hover:border-foreground transition-colors">
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-surface-subtle text-text-dim rounded-sm border border-border group-hover:border-foreground transition-colors">
                      +{project.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </TiltCard>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Project Modal */}
      <AnimatePresence>
        {selectedProject && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-[100dvh] w-full md:w-[600px] max-w-full bg-surface border-l border-border z-[101] shadow-[-20px_0_50px_rgba(0,0,0,0.45)] flex flex-col overflow-y-auto"
              data-lenis-prevent="true"
            >
              <div className="relative w-full aspect-[16/9] bg-muted shrink-0">
                <img
                  src={selectedProject.thumbnail?.startsWith("http") ? selectedProject.thumbnail : "/" + selectedProject.thumbnail}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 z-10 w-[38px] h-[38px] rounded-full bg-[#09090b]/70 backdrop-blur-[10px] text-white flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 md:px-[2.5rem] md:py-[2rem] pb-[2.5rem] flex-1 flex flex-col">
                <span className="text-[11px] font-bold text-primary uppercase tracking-[0.1em] mb-4 block">
                  {selectedProject.category}
                </span>
                <h2 className="text-[clamp(1.5rem,3vw,1.9rem)] font-[800] tracking-[-0.025em] text-foreground mb-4 leading-[1.25]">
                  {selectedProject.title}
                </h2>
                
                <p className="text-[14px] text-text-muted leading-[1.85] mb-8 whitespace-pre-line">
                  {selectedProject.description}
                </p>

                <div className="mb-10">
                  <h4 className="flex items-center gap-2 text-[11px] font-bold tracking-[0.08em] uppercase text-text-subtle mb-4">
                    <span className="text-primary">•</span> Tech Stack
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tags.map((tag: string) => (
                      <span key={tag} className="flex items-center gap-[7px] text-[13px] font-medium px-3 py-1.5 rounded-full bg-surface-subtle border border-border text-foreground">
                        {TECH_ICONS[tag] && (
                          <img src={TECH_ICONS[tag]} alt={tag} className="w-[15px] h-[15px] object-contain" />
                        )}
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-8 border-t border-border flex gap-3">
                  {selectedProject.link && (
                    <a
                      href={selectedProject.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-foreground text-background font-bold text-[13px] shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 hover:shadow-lg transition-all"
                    >
                      {t("projects.visit")} <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {selectedProject.github && (
                    <a
                      href={selectedProject.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-[50px] h-[50px] flex-shrink-0 flex items-center justify-center rounded-xl border border-border bg-surface-subtle text-foreground hover:bg-surface-hover hover:border-border-hover transition-colors"
                    >
                      <FaGithub className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
