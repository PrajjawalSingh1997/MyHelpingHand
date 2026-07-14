import type { NextConfig } from "next";
import { withReticle } from "@reticlehq/next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
};

export default withReticle(nextConfig);
