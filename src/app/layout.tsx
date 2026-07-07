import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SplashScreen } from "@/components/splash-screen";
import { SmoothScroll } from "@/components/smooth-scroll";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RizkyRhamadani — Fullstack Developer",
  description: "Fullstack Developer crafting clean, performant web experiences.",
  keywords: ["fullstack developer", "web developer", "Next.js", "React", "portfolio", "RizkyRhamadani"],
  authors: [{ name: "RizkyRhamadani" }],
  openGraph: {
    title: "RizkyRhamadani — Fullstack Developer",
    description: "Building clean, fast, and comfortable web interfaces — from HTML structure to detailed interactions.",
    url: "https://rizkyrhamadani.dev",
    siteName: "RizkyRhamadani",
    images: [
      {
        url: "/assets/images/og-cover.png",
        width: 1200,
        height: 630,
        alt: "RizkyRhamadani — Fullstack Developer",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RizkyRhamadani — Fullstack Developer",
    description: "Building clean, fast, and comfortable web interfaces — from HTML structure to detailed interactions.",
    images: ["/assets/images/og-cover.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#09090B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground selection:bg-primary/30`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <SmoothScroll>
              <SplashScreen />
              {children}
            </SmoothScroll>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
