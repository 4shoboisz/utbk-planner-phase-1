import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    const legacy = [
      "dashboard",
      "analytics",
      "benefits",
      "documents",
      "invoice",
      "personal-details",
      "time-off",
      "time-tracking",
      "withdrawal-methods",
    ];
    return legacy.map((route) => ({
      source: `/${route}`,
      destination: "/",
      permanent: false,
    }));
  },
  // The floating dev badge sits on top of the sidebar account block.
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
