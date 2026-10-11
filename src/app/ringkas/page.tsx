import type { Metadata } from "next";
import { ResumeView } from "@/components/resume-view";
import { loadPortfolio } from "@/lib/content";
import { site } from "@/content/site";

// Perubahan dari admin muncul paling lambat 60 detik kemudian (sama dengan halaman utama).
export const revalidate = 60;

export const metadata: Metadata = {
  title: `${site.name} · Ringkasan`,
  description: "Versi ringkas portofolio Rizky Rhamadani: layanan, pengalaman, proyek, skill, dan sertifikat dalam satu halaman.",
  alternates: { canonical: "/ringkas" },
};

/** Versi ringkas portofolio untuk dibaca cepat atau dicetak. */
export default async function ResumePage() {
  const data = await loadPortfolio();
  return <ResumeView {...data} />;
}
