import Script from "next/script";

/**
 * Tracking / conversion pixels.
 * ---------------------------------------------------------------------------
 * Each block only renders when its ID is present in the environment, so the
 * site ships clean with zero tracking until you opt in.
 *
 * TODO(user): Add these to `.env.local` (see `.env.example`) to activate:
 *   NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
 *   NEXT_PUBLIC_META_PIXEL_ID=000000000000000
 *   NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
 *
 * Conversion + data-layer events are fired from lib/analytics.ts (CTA clicks,
 * form submits, modal opens, scroll depth). This component just loads the
 * base pixels/containers those events report into.
 */

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;

export function TrackingScripts() {
  return (
    <>
      {/* Google Tag Manager */}
      {GTM_ID ? (
        <Script id="gtm-base" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
      ) : null}

      {/* Google Analytics 4 (gtag.js) */}
      {GA4_ID ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-base" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA4_ID}');`}
          </Script>
        </>
      ) : null}

      {/* Meta (Facebook) Pixel */}
      {META_PIXEL_ID ? (
        <Script id="meta-pixel-base" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
        </Script>
      ) : null}
    </>
  );
}

/** GTM <noscript> fallback — render immediately after <body> opens. */
export function TrackingNoscript() {
  if (!GTM_ID) return null;
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
