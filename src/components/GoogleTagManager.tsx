'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { GTM_ID } from '@/lib/site-config';
import { trackPageView } from '@/lib/analytics';

/**
 * Loads Google Tag Manager on every public page (Fix 1). The admin area is excluded so staff
 * activity never pollutes analytics or ad audiences.
 *
 * Client-side navigations do not reload the page, so a `virtual_page_view` dataLayer event is
 * pushed on each route change. GA4 enhanced measurement already tracks these; use the
 * `virtual_page_view` custom-event trigger in GTM for any tag that should fire per page.
 */
export default function GoogleTagManager() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const firstRender = useRef(true);

  useEffect(() => {
    if (isAdmin || !pathname) return;
    // The initial page view is recorded by GTM's own "All Pages" trigger.
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    trackPageView(pathname);
  }, [pathname, isAdmin]);

  if (isAdmin || !GTM_ID) return null;

  return (
    <>
      <Script id="gtm-init" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
          title="Google Tag Manager"
        />
      </noscript>
    </>
  );
}
