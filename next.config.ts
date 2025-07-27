const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: "standalone",
  experimental: {
    forceSwcTransforms: true,
  },
  images: {
    domains: ["firebasestorage.googleapis.com", "lh3.googleusercontent.com"],
    
  },
};

export default nextConfig;
