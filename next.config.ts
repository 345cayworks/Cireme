import type { NextConfig } from "next";

const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "img-src 'self' data: blob: https:",
  "style-src 'self' 'unsafe-inline'",
  // Google Maps JS API: governance override of Phase 1 non-negotiable #6 and
  // the original Risk #1 resolution (recorded in governance/CIREME_Design_Plan.md).
  // Scoped to Google Maps hosts only; no other third-party origins allowed.
  "script-src 'self' 'unsafe-inline' https://maps.googleapis.com https://maps.gstatic.com",
  "connect-src 'self' https://maps.googleapis.com https://maps.gstatic.com",
  "worker-src 'self' blob:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "form-action 'self'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
  // Keep `ws` (used by the Neon serverless Pool) out of the server bundle;
  // bundling breaks its buffer-mask resolution -> "b.mask is not a function".
  serverExternalPackages: ["ws"],
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
