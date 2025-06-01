import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Analytics from "./analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // ✅ Font performance best practice
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://eventsenseai.vercel.app"), // ✅ Your production URL
  title: "EventSense AI – Auto Clip the Best Video Moments",
  description:
    "Automatically find and clip the most engaging moments from long videos using AI. Perfect for Reels, Shorts, and TikToks.",
  openGraph: {
    title: "EventSense AI",
    description:
      "Summarize and clip top moments from videos using AI – optimized for social media.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "EventSense AI promo banner",
      },
    ],
    type: "website",
    siteName: "EventSense AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "EventSense AI",
    description: "AI-powered video highlights, perfect for Shorts, TikToks & Reels.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <title>EventSense AI – Auto Clip the Best Video Moments</title> {/* Fallback for metadata */}
        <meta name="theme-color" content="#007bff" />
        <meta name="robots" content="index, follow" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="preload" as="image" href="/og-image.jpg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-gradient-to-b from-deep-navy to-black text-black dark:text-white transition-colors`}
      >
        <Analytics />
        <main>{children}</main>
      </body>
    </html>
  );
}
