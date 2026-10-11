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
    // HUD
    "nav.projects": "Proyek",
    "nav.skills": "Skill",
    "nav.certificates": "Sertifikat",
    "nav.bedroom": "Kamar",
    "nav.contact": "Kontak",
    "nav.language": "Ganti bahasa",
    "nav.theme": "Siang dan malam mengikuti jam kamu",
    "nav.sound": "Efek suara",
    "nav.volume": "Atur volume",
    "vol.music": "Musik",
    "vol.sfx": "Efek suara",
    "vol.voice": "Suara obrolan",
    "nav.music": "Musik lo-fi",
    "nav.menu": "Menu",
    "nav.resume": "Versi ringkas",
    "resume.back": "Versi interaktif",
    "resume.print": "Cetak / PDF",
    "resume.services": "Layanan",
    "resume.experience": "Pengalaman",
    "resume.projects": "Proyek",
    "resume.skills": "Skill",
    "resume.certs": "Sertifikat",
    "resume.demo": "Demo",
    "resume.code": "Kode",
    // Intro
    "intro.start": "TEKAN ENTER",
    "intro.hint": "atau klik di mana saja",
    // Hero (tentang saya)
    "hero.greeting": "Halo, saya",
    "hero.role": "Fullstack Developer · Jakarta",
    "hero.intro": "Saya membangun aplikasi web dari ujung ke ujung: database, API, sampai tampilan yang dipakai orang setiap hari. Saya senang mengubah pekerjaan manual yang ribet jadi sistem yang rapi dan mudah dipakai.",
    "hero.s1": "Website & aplikasi web",
    "hero.s2": "Dashboard admin",
    "hero.s3": "Sistem stok & inventaris",
    "hero.s4": "API & database",
    "hero.status": "Terbuka untuk kerja full-time dan freelance",
    "hero.cta": "Lihat proyek",
    "hero.contact": "Hubungi saya",
    "hero.cv": "Unduh CV",
    "hero.quick": "Buru-buru?",
    // Ruangan
    "door.next": "Ruangan berikutnya",
    "door.home": "Kembali ke ruang tamu",
    "obj.cat": "Elus kucing",
    // Projects
    "projects.title": "Proyek",
    "projects.closed": "Laptop masih tertutup",
    "projects.waiting": "Rizky lagi jalan ke kursinya. Tunggu sebentar, atau buka sendiri.",
    "projects.openNow": "Buka sekarang",
    "projects.live": "Demo",
    "projects.code": "Kode",
    // Skills
    "skills.title": "Skill",
    "skills.items": "bingkai",
    "skills.frontend": "Frontend",
    "skills.backend": "Backend",
    "skills.database": "Database",
    "skills.tools": "Tools",
    // Certificates
    "certs.title": "Sertifikat",
    "certs.journey": "Perjalanan",
    "bedroom.title": "Kamar Rizky",
    // Contact
    "contact.title": "Kontak",
    "contact.flow": "Cara kerja sama",
    "contact.testi": "Kata mereka",
    "contact.end": "Pintunya selalu terbuka. Mari kerja bareng.",
    "contact.lead": "Paling cepat lewat email. Untuk proyek freelance, ceritakan singkat kebutuhan dan tenggat waktunya.",
    "contact.name": "Nama",
    "contact.email": "Email",
    "contact.message": "Pesan",
    "contact.send": "Kirim",
    "contact.sending": "Mengirim...",
    "contact.sent": "Pesan terkirim!",
    "contact.sentDesc": "Terima kasih, saya akan membalas secepatnya.",
    "contact.sendAnother": "Kirim pesan lain",
    "contact.error": "Pesan gagal terkirim. Coba lagi, atau kirim email langsung.",
    // Footer
    "footer.top": "Kembali ke atas",
  },
  en: {
    // HUD
    "nav.projects": "Projects",
    "nav.skills": "Skills",
    "nav.certificates": "Certificates",
    "nav.bedroom": "Room",
    "nav.contact": "Contact",
    "nav.language": "Change language",
    "nav.theme": "Day and night follow your clock",
    "nav.sound": "Sound effects",
    "nav.volume": "Volume",
    "vol.music": "Music",
    "vol.sfx": "Sound effects",
    "vol.voice": "Voices",
    "nav.music": "Lo-fi music",
    "nav.menu": "Menu",
    "nav.resume": "Quick view",
    "resume.back": "Interactive version",
    "resume.print": "Print / PDF",
    "resume.services": "Services",
    "resume.experience": "Experience",
    "resume.projects": "Projects",
    "resume.skills": "Skills",
    "resume.certs": "Certificates",
    "resume.demo": "Demo",
    "resume.code": "Code",
    // Intro
    "intro.start": "PRESS ENTER",
    "intro.hint": "or click anywhere",
    // Hero (about me)
    "hero.greeting": "Hi, I'm",
    "hero.role": "Fullstack Developer · Jakarta",
    "hero.intro": "I build web applications end to end: the database, the API, and the screens people use every day. I enjoy turning messy manual work into tidy systems that are easy to use.",
    "hero.s1": "Websites & web apps",
    "hero.s2": "Admin dashboards",
    "hero.s3": "Stock & inventory systems",
    "hero.s4": "APIs & databases",
    "hero.status": "Available for full-time and freelance work",
    "hero.cta": "See projects",
    "hero.contact": "Contact me",
    "hero.cv": "Download CV",
    "hero.quick": "In a hurry?",
    // Rooms
    "door.next": "Next room",
    "door.home": "Back to the living room",
    "obj.cat": "Pet the cat",
    // Projects
    "projects.title": "Projects",
    "projects.closed": "The laptop is still closed",
    "projects.waiting": "Rizky is walking to his chair. Wait a moment, or open it yourself.",
    "projects.openNow": "Open now",
    "projects.live": "Live demo",
    "projects.code": "Code",
    // Skills
    "skills.title": "Skills",
    "skills.items": "frames",
    "skills.frontend": "Frontend",
    "skills.backend": "Backend",
    "skills.database": "Database",
    "skills.tools": "Tools",
    // Certificates
    "certs.title": "Certificates",
    "certs.journey": "Journey",
    "bedroom.title": "Rizky's Room",
    // Contact
    "contact.title": "Contact",
    "contact.flow": "How we'll work together",
    "contact.testi": "What people say",
    "contact.end": "The door is always open. Let's build something.",
    "contact.lead": "Email is the fastest way to reach me. For freelance work, include a short brief and your timeline.",
    "contact.name": "Name",
    "contact.email": "Email",
    "contact.message": "Message",
    "contact.send": "Send",
    "contact.sending": "Sending...",
    "contact.sent": "Message sent!",
    "contact.sentDesc": "Thanks, I will reply soon.",
    "contact.sendAnother": "Send another message",
    "contact.error": "The message could not be sent. Please try again, or email me directly.",
    // Footer
    "footer.top": "Back to top",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("id");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("rr_locale");
      // Dibaca setelah mount supaya HTML dari server dan klien tetap sama saat hidrasi.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved === "en" || saved === "id") setLocale(saved);
    } catch {
      // localStorage tidak tersedia (mode privat, dll). Pakai default.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    try {
      localStorage.setItem("rr_locale", newLocale);
    } catch {
      // Abaikan jika storage diblokir.
    }
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
