// app/analytics.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: Record<string, unknown>) => void;
    dataLayer: any[];
  }
}

const GA_MEASUREMENT_ID = "G-FMHVT0S6LM";

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", GA_MEASUREMENT_ID, {
        page_path: pathname,
      });
    }
  }, [pathname]);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="beforeInteractive"
      />
      <Script id="google-analytics" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
          console.log('Google Analytics initialized with ID: ${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
