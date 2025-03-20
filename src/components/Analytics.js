"use client";

import Script from "next/script";
import { useEffect } from "react";

export default function Analytics() {
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
            send_page_view: true // Disable automatic page view tracking
          });
        `}
         </Script>
      </>
   );
}
