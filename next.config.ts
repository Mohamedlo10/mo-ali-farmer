import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Ajoute la résolution des alias de chemins
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "."),
    };
    return config;
  },
  // Désactive le strict mode pour éviter les doubles rendus en développement
  reactStrictMode: false,
};

export default nextConfig;
