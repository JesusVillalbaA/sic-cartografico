import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  reactStrictMode: false,
    env: {
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: "pk" + ".eyJ1IjoibGFyazIwMjYiLCJhIjoiY21vYWRlM3J2MDVrdzJucHl0dTMweGloaiJ9" + ".3lrfYfOhMgN0ZhsnHSbVZQ",
    NEXT_PUBLIC_SUPABASE_URL: "https://glbxqcbcjudzxxqawbhg.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "sb_publishable_3Jf5_v73whez5a9lkju7uA_3hCFLvDt",
  },
  serverExternalPackages: ['pg', 'bcryptjs', '@turf/turf', 'html2canvas', 'jspdf'],
  experimental: {
    serverActions: {
      allowedOrigins: ['26.159.197.231', 'localhost:3000'],
    },
  },
};

export default nextConfig;