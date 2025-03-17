"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";

export default function Analytics() {
   const pathname = usePathname();
   const searchParams = useSearchParams();

   useEffect(() => {
      // Track page views on route change
      const url =
         pathname + (searchParams.toString() ? `?${searchParams}` : "");
      window.gtag("event", "page_view", {
         page_path: url,
         page_title: document.title,
      });
   }, [pathname, searchParams]);

   return (
      <>
         <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
         />
         <Script id="gtag-init" strategy="afterInteractive">
            {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          
          gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
            page_path: window.location.pathname,
            send_page_view: false // Disable automatic page view tracking
          });
        `}
         </Script>
      </>
   );
}
