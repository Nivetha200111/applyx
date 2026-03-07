import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
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
    default: "ApplyX | AI Resume Tailoring for India",
    template: "%s | ApplyX",
  },
  description:
    "ApplyX tailors ATS-optimized resumes for Indian job seekers in under 15 seconds with AI-powered job description analysis.",
  keywords: [
    "AI resume tailoring India",
    "ATS resume builder",
    "resume optimization",
    "job application India",
    "resume tailoring SaaS",
  ],
  openGraph: {
    title: "ApplyX | AI Resume Tailoring for India",
    description:
      "Upload one master resume, paste any job description, and get a tailored ATS-ready PDF in seconds.",
    url: "https://applyx.in",
    siteName: "ApplyX",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ApplyX | AI Resume Tailoring for India",
    description:
      "One-click resume tailoring built for high-volume job applications in India.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          manrope.variable,
          ibmPlexMono.variable,
          "min-h-screen bg-background font-sans text-foreground antialiased",
        )}
      >
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
