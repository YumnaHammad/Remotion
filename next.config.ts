import type { NextConfig } from "next";
import path from "path";

/** Turbopack requires relative aliases — absolute Windows paths fail. */
const emptyModuleRelative = "./src/utils/empty-module.ts";
const emptyModuleAbsolute = path.join(process.cwd(), "src/utils/empty-module.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    "@remotion/bundler",
    "@remotion/renderer",
    "@remotion/lambda",
    "esbuild",
    "@esbuild/win32-x64",
    "@esbuild/win32-arm64",
    "@esbuild/darwin-x64",
    "@esbuild/darwin-arm64",
    "@esbuild/linux-x64",
    "@esbuild/linux-arm64",
  ],
  turbopack: {
    resolveAlias: {
      "@remotion/bundler": emptyModuleRelative,
      "@remotion/renderer": emptyModuleRelative,
      "@remotion/lambda": emptyModuleRelative,
      "@remotion/lambda/client": emptyModuleRelative,
      esbuild: emptyModuleRelative,
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@remotion/bundler": emptyModuleAbsolute,
        "@remotion/renderer": emptyModuleAbsolute,
        esbuild: emptyModuleAbsolute,
      };
    }
    return config;
  },
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
