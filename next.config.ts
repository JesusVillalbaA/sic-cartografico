import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  reactStrictMode: false,
  serverExternalPackages: ['pg', 'bcryptjs', '@turf/turf', 'html2canvas', 'jspdf'],
  experimental: {
    serverActions: {
      allowedOrigins: ['26.159.197.231', 'localhost:3000'],
    },
  },
};

export default nextConfig;