/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use the environment variable PORT or default to 3002
  env: {
    PORT: process.env.PORT || '3002',
  },
  // Configure rewrites for development proxy if needed
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/:path*', // Proxy to Backend
      },
    ];
  },
  // Other Next.js config options
  reactStrictMode: true,
};

export default nextConfig;