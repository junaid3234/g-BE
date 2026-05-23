import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/components/providers/clerk-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "GingiAI — AI Gingivitis Screening Platform",
    template: "%s | GingiAI",
  },
  description:
    "AI-assisted gingivitis screening, severity prediction, and personalized oral health recommendations. Built by JVX Labs.",
  keywords: ["gingivitis", "dental screening", "AI health", "oral health", "machine learning"],
  authors: [{ name: "JVX Labs", url: "https://jvxlabs.com" }],
  creator: "JVX Labs",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "GingiAI — AI Gingivitis Screening Platform",
    description:
      "AI-assisted gingivitis screening, severity prediction, and personalized oral health recommendations.",
    siteName: "GingiAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "GingiAI — AI Gingivitis Screening Platform",
    description: "AI-assisted gingivitis screening and oral health recommendations.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f0fafa" },
    { media: "(prefers-color-scheme: dark)", color: "#080e17" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
