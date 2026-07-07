"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Locale = "id" | "en";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const translations = {
  id: {
    // Navbar
    "nav.home": "Beranda",
    "nav.about": "Tentang",
    "nav.skills": "Kemampuan",
    "nav.projects": "Proyek",
    "nav.certificates": "Sertifikat",
    "nav.contact": "Kontak",
    // Hero & About
    "hero.greeting": "Halo, saya",
    "hero.role": "FULLSTACK DEVELOPER",
    "hero.desc": "Saya berkolaborasi dengan berbagai organisasi untuk membangun produk digital yang intuitif, mengubah tantangan bisnis yang kompleks menjadi perjalanan digital yang mulus bagi pengguna.",
    "about.desc": "Dengan menjembatani visi strategis dan eksekusi produk, saya membantu berbagai brand menciptakan ekosistem digital yang kuat. Fokus utama saya adalah meningkatkan pengalaman pengguna sekaligus menghadirkan solusi yang berdampak langsung pada pertumbuhan bisnis berkelanjutan.",
    "about.downloadCv": "Unduh CV",
    // Skills
    "skills.title": "Keahlian",
    "skills.highlight": "Utama",
    // Projects
    "projects.title": "Proyek",
    "projects.highlight": "Saya",
    "projects.desc": "Kumpulan project yang pernah saya buat, mulai dari antarmuka pengguna hingga sistem backend yang kompleks.",
    "projects.all": "Semua",
    "projects.visit": "Kunjungi Project",
    // Certificates
    "certs.title": "Sertifikat",
    "certs.highlight": "& Penghargaan",
    "certs.empty": "Belum diunggah",
    // Contact
    "contact.title": "Hubungi",
    "contact.highlight": "Saya",
    "contact.desc": "Punya project, pertanyaan, atau sekadar ingin ngobrol? Jangan ragu untuk menghubungi saya.",
    "contact.locationTitle": "Lokasi",
    "contact.locationValue": "Jakarta, Indonesia",
    "contact.name": "Nama Lengkap",
    "contact.email": "Alamat Email",
    "contact.message": "Pesan",
    "contact.send": "Kirim Pesan",
    "contact.sent": "Pesan Terkirim!",
    "contact.sentDesc": "Terima kasih telah menghubungi. Saya akan segera membalas pesanmu.",
    "contact.sendAnother": "Kirim pesan lain",
    "contact.sending": "Mengirim...",
    // Footer
    "footer.rights": "Hak Cipta Dilindungi."
  },
  en: {
    // Navbar
    "nav.home": "Home",
    "nav.about": "About",
    "nav.skills": "Skills",
    "nav.projects": "Projects",
    "nav.certificates": "Certificates",
    "nav.contact": "Contact",
    // Hero & About
    "hero.greeting": "Hi, I am",
    "hero.role": "FULLSTACK DEVELOPER",
    "hero.desc": "I partner with forward-thinking organizations to build intuitive, user-centric digital products that turn complex business challenges into seamless digital journeys.",
    "about.desc": "By bridging the gap between strategic vision and flawless execution, I help brands create cohesive digital ecosystems. My focus is on elevating the user experience while delivering scalable solutions that drive sustainable business growth.",
    "about.downloadCv": "Download CV",
    // Skills
    "skills.title": "My",
    "skills.highlight": "Skills",
    // Projects
    "projects.title": "My",
    "projects.highlight": "Projects",
    "projects.desc": "A collection of projects I have built, ranging from user interfaces to complex backend systems.",
    "projects.all": "All",
    "projects.visit": "Visit Project",
    // Certificates
    "certs.title": "Certificates",
    "certs.highlight": "& Awards",
    "certs.empty": "Not uploaded yet",
    // Contact
    "contact.title": "Get In",
    "contact.highlight": "Touch",
    "contact.desc": "Got a project, a question, or just want to chat? Feel free to reach out to me.",
    "contact.locationTitle": "Location",
    "contact.locationValue": "Jakarta, Indonesia",
    "contact.name": "Full Name",
    "contact.email": "Email Address",
    "contact.message": "Message",
    "contact.send": "Send Message",
    "contact.sent": "Message Sent!",
    "contact.sentDesc": "Thanks for reaching out. I will get back to you shortly.",
    "contact.sendAnother": "Send another message",
    "contact.sending": "Sending...",
    // Footer
    "footer.rights": "All Rights Reserved."
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("id");

  useEffect(() => {
    const saved = localStorage.getItem("rr_locale") as Locale;
    if (saved === "en" || saved === "id") setLocale(saved);
  }, []);

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem("rr_locale", newLocale);
  };

  const t = (key: string): string => {
    return translations[locale][key as keyof typeof translations["id"]] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
