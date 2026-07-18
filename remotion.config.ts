import path from "node:path";
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setCodec("h264");

/** Same `@/` alias as Next.js — required for Root.tsx imports during CLI/API render. */
Config.overrideWebpackConfig((config) => {
  config.resolve ??= {};
  config.resolve.alias = {
    ...config.resolve.alias,
    "@": path.resolve(process.cwd(), "src"),
  };
  return config;
});
