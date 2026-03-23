import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/MyHelpingHand",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
