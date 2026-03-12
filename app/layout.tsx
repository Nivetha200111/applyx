import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope, Press_Start_2P, VT323 } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import "./globals.css";
import { PageTransition } from "@/components/ui/page-transition";
import { cn } from "@/lib/utils";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const pressStart2P = Press_Start_2P({
  variable: "--font-press-start",
  subsets: ["latin"],
  weight: "400",
});

const vt323 = VT323({
  variable: "--font-vt323",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://applyx.space"),
  title: {
    default: "ApplyX | Job Application Tracker + AI Resume Tailoring",
    template: "%s | ApplyX",
  },
  description:
    "ApplyX helps job seekers tailor resumes, track applications, and stay organized in one workflow.",
  keywords: [
    "job application tracker",
    "AI resume tailoring",
    "ATS resume builder",
    "resume tailoring app",
    "job tracker",
  ],
  openGraph: {
    title: "ApplyX | Job Application Tracker + AI Resume Tailoring",
    description:
      "Tailor every resume, track every job, and keep your application workflow in one place.",
    url: "https://applyx.space",
    siteName: "ApplyX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ApplyX | Job Application Tracker + AI Resume Tailoring",
    description:
      "Replace your messy spreadsheet with one workflow for resume tailoring and job tracking.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          manrope.variable,
          ibmPlexMono.variable,
          pressStart2P.variable,
          vt323.variable,
          "min-h-screen bg-background font-sans text-foreground antialiased",
        )}
      >
        <Script id="applyx-theme" strategy="beforeInteractive">
          {`try{const key="applyx-theme";const stored=localStorage.getItem(key);const theme=stored==="light"||stored==="dark"?stored:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.classList.toggle("dark",theme==="dark");document.documentElement.style.colorScheme=theme;}catch(e){}`}
        </Script>
        <PageTransition>{children}</PageTransition>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
