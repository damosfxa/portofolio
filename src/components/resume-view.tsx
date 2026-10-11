"use client";

import Link from "next/link";
import { ArrowLeft, Download, ExternalLink, Lock, Mail, Printer } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { useLanguage } from "@/contexts/LanguageContext";
import { site } from "@/content/site";
import { tidyTitle } from "@/lib/text";
import type { Certificate, Project, Skill, TestimonialItem, TimelineItem } from "@/lib/types";

type Props = { projects: Project[]; skills: Skill[]; certificates: Certificate[]; timeline: TimelineItem[]; testimonials: TestimonialItem[] };

/** Judul bagian di versi ringkas. */
function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 border-b-2 border-line pb-2 font-pixel text-xl font-bold text-ink print:border-black/30">{children}</h2>;
}

/**
 * Versi ringkas portofolio: satu halaman biasa (tanpa elemen gim) untuk perekrut yang ingin
 * membaca cepat, dan rapi saat dicetak atau disimpan sebagai PDF.
 */
export function ResumeView({ projects, skills, certificates, timeline, testimonials }: Props) {
  const { t, locale, setLocale } = useLanguage();

  // Skill dikelompokkan per kategori (kategori kosong masuk "Lainnya").
  const other = locale === "id" ? "Lainnya" : "Other";
  const groups = skills.reduce<Record<string, string[]>>((acc, s) => {
    // Kategori di admin ditulis "Backend - Framework"; ditampilkan "Backend · Framework".
    const key = s.category?.trim().replace(/\s+[-–—]\s+/g, " · ") || other;
    (acc[key] ??= []).push(s.name);
    return acc;
  }, {});

  const btn =
    "inline-flex items-center gap-2 border-2 border-line bg-panel px-3 py-1.5 font-pixel text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5";

  return (
    <div className="min-h-screen bg-background text-ink print:bg-white print:text-black">
      {/* Bilah atas: tidak ikut dicetak */}
      <div className="sticky top-0 z-10 border-b-2 border-line bg-panel print:hidden">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <Link href="/" className={btn}>
            <ArrowLeft className="h-4 w-4" /> {t("resume.back")}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setLocale(locale === "id" ? "en" : "id")} className={btn} aria-label={t("nav.language")}>
              {locale === "id" ? "EN" : "ID"}
            </button>
            {site.cv && (
              <a href={site.cv[locale]} download className={btn}>
                <Download className="h-4 w-4" /> {t("hero.cv")}
              </a>
            )}
            <button onClick={() => window.print()} className={btn}>
              <Printer className="h-4 w-4" /> {t("resume.print")}
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 py-10 print:py-0">
        {/* Identitas */}
        <header className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-start">
          {site.photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={site.photo} alt={site.name} className="h-24 w-24 shrink-0 border-2 border-line object-cover" />
          )}
          <div className="flex flex-col gap-3">
            <div>
              <h1 className="font-pixel text-4xl font-bold">{site.name}</h1>
              <p className="mt-1 font-semibold text-ink-soft">{t("hero.role")}</p>
            </div>
            <p className="leading-relaxed">{t("hero.intro")}</p>
            <p className="flex items-center gap-2 text-sm font-semibold">
              <span className="inline-block h-2.5 w-2.5 bg-[#5BA35B]" aria-hidden /> {t("hero.status")}
            </p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <li>
                <a href={`mailto:${site.email}`} className="inline-flex items-center gap-1.5 underline-offset-2 hover:underline">
                  <Mail className="h-4 w-4" /> {site.email}
                </a>
              </li>
              <li>
                <a href={site.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 underline-offset-2 hover:underline">
                  <FaGithub className="h-4 w-4" /> {site.github.replace("https://", "")}
                </a>
              </li>
              <li>
                <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 underline-offset-2 hover:underline">
                  <FaLinkedin className="h-4 w-4" /> {site.linkedin.replace("https://www.", "")}
                </a>
              </li>
            </ul>
          </div>
        </header>

        {/* Layanan */}
        <section className="mb-10 break-inside-avoid">
          <Heading>{t("resume.services")}</Heading>
          <ul className="flex flex-wrap gap-2">
            {(["hero.s1", "hero.s2", "hero.s3", "hero.s4"] as const).map((k) => (
              <li key={k} className="border-2 border-line px-3 py-1 text-sm font-semibold">
                {t(k)}
              </li>
            ))}
          </ul>
        </section>

        {/* Pengalaman (muncul bila sudah diisi di admin) */}
        {timeline.length > 0 && (
          <section className="mb-10">
            <Heading>{t("resume.experience")}</Heading>
            <ol className="flex flex-col gap-5">
              {timeline.map((item) => (
                <li key={item.id} className="grid break-inside-avoid gap-1 sm:grid-cols-[9rem_1fr] sm:gap-4">
                  <span className="text-sm font-semibold text-ink-soft">{item.year}</span>
                  <div>
                    <h3 className="font-bold">{item.title}</h3>
                    {item.description && <p className="mt-1 text-sm leading-relaxed">{item.description}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Proyek */}
        {projects.length > 0 && (
          <section className="mb-10">
            <Heading>{t("resume.projects")}</Heading>
            <div className="flex flex-col gap-6">
              {projects.map((p) => (
                <article key={p.id} className="break-inside-avoid">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="text-lg font-bold">{p.title}</h3>
                    {p.category && <span className="text-sm text-ink-soft">{p.category}</span>}
                  </div>
                  {p.description && <p className="mt-1 text-sm leading-relaxed">{p.description}</p>}
                  {(p.tags ?? []).length > 0 && <p className="mt-2 text-sm font-semibold text-ink-soft">{(p.tags ?? []).join(" · ")}</p>}
                  <div className="mt-2 flex flex-wrap gap-4 text-sm">
                    {p.link && (
                      <a href={p.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold underline-offset-2 hover:underline">
                        <ExternalLink className="h-4 w-4" /> {t("resume.demo")}
                        <span className="hidden print:inline"> ({p.link})</span>
                      </a>
                    )}
                    {p.code_private ? (
                      <span className="inline-flex items-center gap-1.5 text-ink-soft" title={t("projects.privateHint")}>
                        <Lock className="h-4 w-4" /> {t("projects.private")}
                      </span>
                    ) : (
                      p.github && (
                        <a href={p.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold underline-offset-2 hover:underline">
                          <FaGithub className="h-4 w-4" /> {t("resume.code")}
                          <span className="hidden print:inline"> ({p.github})</span>
                        </a>
                      )
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Testimoni asli (muncul bila sudah diisi di content/collab.ts) */}
        {testimonials.length > 0 && (
          <section className="mb-10">
            <Heading>{t("contact.testi")}</Heading>
            <div className="flex flex-col gap-4">
              {testimonials.map((item) => (
                <figure key={item.id} className="break-inside-avoid border-l-4 border-coin pl-4">
                  <blockquote className="text-sm leading-relaxed">&ldquo;{(locale === "en" && item.quote_en) || item.quote}&rdquo;</blockquote>
                  <figcaption className="mt-1 text-sm font-semibold">
                    {item.name} {item.role && <span className="font-normal text-ink-soft">· {(locale === "en" && item.role_en) || item.role}</span>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* Skill */}
        {skills.length > 0 && (
          <section className="mb-10 break-inside-avoid">
            <Heading>{t("resume.skills")}</Heading>
            <dl className="flex flex-col gap-2 text-sm">
              {Object.entries(groups)
                .sort(([a], [b]) => (a === other ? 1 : b === other ? -1 : a.localeCompare(b)))
                .map(([group, names]) => (
                <div key={group} className="grid gap-1 sm:grid-cols-[9rem_1fr] sm:gap-4">
                  <dt className="font-semibold text-ink-soft">{group}</dt>
                  <dd>{names.join(", ")}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* Sertifikat */}
        {certificates.length > 0 && (
          <section className="mb-10 break-inside-avoid">
            <Heading>{t("resume.certs")}</Heading>
            <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
              {certificates.map((c) => (
                <li key={c.id}>
                  {c.image ? (
                    <a href={c.image} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
                      {tidyTitle(c.title)}
                    </a>
                  ) : (
                    tidyTitle(c.title)
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
