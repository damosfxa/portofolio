import { Hud } from "@/components/hud";
import { Preloader } from "@/components/preloader";
import { RoomStyles } from "@/components/game/scenery";
import { HeroSection } from "@/components/hero-section";
import { ProjectsSection } from "@/components/projects-section";
import { SkillsSection } from "@/components/skills-section";
import { CertificatesSection } from "@/components/certificates-section";
import { BedroomSection } from "@/components/bedroom-section";
import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/footer";
import { loadPortfolio } from "@/lib/content";

// Perubahan dari admin muncul paling lambat 60 detik kemudian.
export const revalidate = 60;

export default async function Home() {
  const { projects, skills, certificates, timeline, testimonials } = await loadPortfolio();

  const sections = {
    projects: projects.length > 0,
    skills: skills.length > 0,
    // Ruang sertifikat juga memuat papan riwayat, jadi tampil bila salah satunya ada.
    certificates: certificates.length > 0 || timeline.length > 0,
  };

  // Urutan ruangan yang benar-benar tampil; pintu kanan tiap ruangan menuju ruangan berikutnya.
  const rooms = [
    sections.projects && "projects",
    sections.skills && "skills",
    sections.certificates && "certificates",
    "bedroom",
    "contact",
  ].filter(Boolean) as string[];
  const after = (id: string) => rooms[rooms.indexOf(id) + 1] ?? "contact";

  // Nomor bagian dihitung dari bagian yang benar-benar tampil.
  let n = 0;
  const next = () => ++n;

  return (
    <div id="top" className="wallpaper relative min-h-screen text-ink font-sans">
      <RoomStyles />
      <Preloader />
      <Hud sections={sections} />

      <main className="w-full overflow-x-clip">
        <HeroSection nextRoom={rooms[0]} />
        {sections.projects && <ProjectsSection index={next()} projects={projects} nextRoom={after("projects")} />}
        {sections.skills && <SkillsSection index={next()} skills={skills} nextRoom={after("skills")} />}
        {sections.certificates && (
          <CertificatesSection index={next()} certificates={certificates} timeline={timeline} nextRoom={after("certificates")} />
        )}
        <BedroomSection index={next()} nextRoom="contact" />
        <ContactSection index={next()} testimonials={testimonials} />
      </main>

      <Footer />
    </div>
  );
}
