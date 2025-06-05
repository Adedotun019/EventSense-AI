import type { Metadata } from 'next';
import Script from "next/script";
import "./globals.css";

export const metadata = {
  metadataBase: new URL("http://localhost:3001"),
  title: "EventSense AI – Auto Clip the Best Video Moments",
  description:
    "Automatically find and clip the most engaging moments from long videos using AI. Perfect for Reels, Shorts, and TikToks.",
  openGraph: {
    title: "EventSense AI",
    description: "Summarize and clip top moments from videos using AI – optimized for social media.",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0f172a" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <noscript>
          <style>{`body { opacity: 1 !important; }`}</style>
        </noscript>
      </head>
      <body className="transition-colors duration-300 dark:bg-black dark:text-white">
        {children}

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-FMHVT0S6LM"
          strategy="afterInteractive"
        />
        <Script id="ga-setup" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-FMHVT0S6LM');
          `}
        </Script>
      </body>
    </html>
  );
}
