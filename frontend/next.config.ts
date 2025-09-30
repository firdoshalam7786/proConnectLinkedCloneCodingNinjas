import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ESLint build warnings 
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

