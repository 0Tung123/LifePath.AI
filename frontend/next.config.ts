import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_API_URL: 'http://localhost:3000'
  },
  server: {
    port: 3002,
  }
};

export default nextConfig;
