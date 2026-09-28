import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    '192.168.50.78',
    '192.168.0.103',
  ],
  // `/demo` est devenu `/playground` le 28 septembre 2026 : les liens déjà
  // partagés doivent continuer d'arriver quelque part.
  async redirects() {
    return [{ source: "/demo", destination: "/playground", permanent: true }];
  },
};

export default nextConfig;
