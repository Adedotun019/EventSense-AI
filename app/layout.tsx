import Script from "next/script";
import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://eventsenseai.vercel.app"),  // CHANGE THIS TO YOUR DOMAIN
  title: "EventSense AI – Auto Clip the Best Video Moments",
  description:
    "Automatically find and clip the most engaging moments from long videos using AI. Perfect for Reels, Shorts, and TikToks.",
  openGraph: {
    title: "EventSense AI – Auto Clip the Best Video Moments",
    description: "Summarize and clip top moments from videos using AI – optimized for social media.",
    url: "https://eventsenseai.vercel.app",  // CHANGE THIS TO YOUR DOMAIN
    siteName: "EventSense AI",
    images: [
      {
        url: "https://eventsenseai.vercel.app/og-image.jpg",  // FULL URL REQUIRED FOR OG IMAGE
        width: 1200,
        height: 630,
        alt: "EventSense AI promo banner",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "EventSense AI – Auto Clip the Best Video Moments",
    description: "AI-powered video highlights, perfect for Shorts, TikToks & Reels.",
    images: ["https://eventsenseai.vercel.app/og-image.jpg"],  // FULL URL REQUIRED FOR TWITTER IMAGE
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