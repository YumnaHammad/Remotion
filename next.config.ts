import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
  transpilePackages: [
    "remotion",
    "@remotion/player",
    "@remotion/media-utils",
    "@remotion/transitions",
    "@remotion/captions",
    "@remotion/shapes",
    "@remotion/google-fonts",
    "@remotion/three",
    "@remotion/lottie",
    "@remotion/zod-types",
    "@remotion/noise",
    "@remotion/gif",
    "@remotion/motion-blur",
  ],
};

export default nextConfig;
