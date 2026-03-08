import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import "./globals.css";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://applyx.in"),
  title: {
    default: "ApplyX | Job Application Tracker + AI Resume Tailoring",
    template: "%s | ApplyX",
  },
  description:
    "ApplyX is an AI-powered job application tracker for Indian job seekers. Track applications, auto-fill from JDs, tailor ATS resumes, and prep for interviews.",
  keywords: [
    "job application tracker India",
    "AI resume tailoring India",
    "ATS resume builder",
    "job tracker spreadsheet",
    "resume tailoring SaaS",
  ],
  openGraph: {
    title: "ApplyX | Job Application Tracker + AI Resume Tailoring",
    description:
      "Track every application, paste JDs to auto-fill with AI, tailor ATS resumes, and access curated prep resources.",
    url: "https://applyx.in",
    siteName: "ApplyX",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ApplyX | Job Application Tracker + AI Resume Tailoring",
    description:
      "Replace your messy Excel tracker with AI-powered job application tracking built for India.",
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
          "min-h-screen bg-background font-sans text-foreground antialiased",
        )}
      >
        <Script id="applyx-theme" strategy="beforeInteractive">
          {`try{const key="applyx-theme";const stored=localStorage.getItem(key);const theme=stored==="light"||stored==="dark"?stored:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.classList.toggle("dark",theme==="dark");document.documentElement.style.colorScheme=theme;}catch(e){}`}
        </Script>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
