/** @type {import('next').NextConfig} */

// Listings that went live with placeholder "untitled-…" URLs (Fix 2 and Fix 6.4).
// 301 so Google Ads, shared WhatsApp links and search results move to the new address.
// The new slugs resolve even before the database rename runs (see src/lib/property-slugs.ts).
const LEGACY_LISTING_REDIRECTS = [
  ['untitled-property-listing-draft-5823', '6-bedroom-house-pool-peduase-aburi'],
  ['untitled-property-listing-draft-1008', '4-bedroom-house-pool-for-sale-east-legon'],
  ['untitled-property-listing-draft-9116', '3-bedroom-house-boys-quarters-for-sale-lakeside-accra'],
];

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
];

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return LEGACY_LISTING_REDIRECTS.map(([from, to]) => ({
      source: `/properties/${from}`,
      destination: `/properties/${to}`,
      statusCode: 301,
    }));
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Keep the admin portal and APIs out of search engines.
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        // Cache all static images, icons, and fonts for 1 year
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
