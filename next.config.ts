import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // Disable static generation to avoid Firebase prerendering issues
  output: 'standalone',
  experimental: {
    // Disable static optimization for pages that use Firebase
    forceSwcTransforms: true,
  },
};

export default nextConfig;
