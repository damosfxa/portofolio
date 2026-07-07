import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { AboutSection } from "@/components/about-section";
import { SkillsSection } from "@/components/skills-section";
import { ProjectsSection } from "@/components/projects-section";
import { CertificatesSection } from "@/components/certificates-section";
import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/footer";
import { supabase } from "@/lib/supabase";

export const revalidate = 0; // Force dynamic to ensure data is always fresh

export default async function Home() {
  const { data: profile } = await supabase.from("profile").select("*").limit(1).single();

  return (
    <main className="flex min-h-screen flex-col relative w-full overflow-hidden">
      <Navbar />
      
      {/* Background decorations */}
      <div className="fixed inset-0 -z-10 bg-background h-screen" style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" style={{ transform: 'translateZ(0)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-500/5 blur-[120px] pointer-events-none" style={{ transform: 'translateZ(0)' }} />
      </div>

      <div className="flex-grow">
        <HeroSection profile={profile || {}} />
        <AboutSection profile={profile || {}} />
        <SkillsSection />
        <ProjectsSection />
        <CertificatesSection />
        <ContactSection />
      </div>
      
      <Footer />
    </main>
  );
}
