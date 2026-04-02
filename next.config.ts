import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  // Required: Leaflet accesses `window` on import.
  // We handle this via dynamic import in the map component,
  // but this config ensures no SSR issues bleed through.
  transpilePackages: ["leaflet", "react-leaflet"],
};

export default nextConfig;