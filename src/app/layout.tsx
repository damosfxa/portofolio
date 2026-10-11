import type { Metadata, Viewport } from "next";
import { Nunito, Pixelify_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Providers } from "@/components/providers";

// Nunito (bulat, nyaman dibaca) untuk teks, Pixelify Sans untuk judul dan label bernuansa pixel.
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const pixelify = Pixelify_Sans({
  variable: "--font-pixelify",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteTitle = "Rizky Rhamadani | Fullstack Developer";
const siteDescription =
  "Fullstack Developer di Jakarta. Membangun aplikasi web untuk operasional bisnis dengan Next.js, TypeScript, dan PostgreSQL.";

export const metadata: Metadata = {
  metadataBase: new URL("https://rizkyrhamadani.com"),
  title: siteTitle,
  description: siteDescription,
  keywords: ["fullstack developer", "web developer", "Next.js", "TypeScript", "PostgreSQL", "Jakarta", "Rizky Rhamadani"],
  authors: [{ name: "Rizky Rhamadani" }],
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "https://rizkyrhamadani.com",
    siteName: "Rizky Rhamadani",
    images: [
      {
        url: "/assets/images/og-cover.png",
        width: 1200,
        height: 630,
        alt: siteTitle,
      },
    ],
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/assets/images/og-cover.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#F3E3C3",
};

// Dijalankan sebelum halaman digambar: intro hanya tampil sekali per sesi,
// dan dilewati untuk pengguna yang mengaktifkan "kurangi gerakan".
const introScript = `try{if(sessionStorage.getItem("rr_intro")||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.intro="done"}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Kelas variabel font dipasang di <html> karena --font-sans di globals.css dihitung di :root.
    <html lang="id" className={`${nunito.variable} ${pixelify.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body
        className={`font-sans antialiased min-h-screen bg-background text-foreground selection:bg-primary/30`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <LanguageProvider>
            <Providers>{children}</Providers>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
