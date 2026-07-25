import React from "react";
import { Audio } from "remotion";
import { rewriteBrokenMediaUrl } from "@/lib/sample-media";

interface BackgroundMusicProps {
  musicUrl?: string;
  /** 0–1, default 0.35 */
  volume?: number;
}

/** Optional background track — works in preview and export when musicUrl is set. */
export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({
  musicUrl,
  volume = 0.35,
}) => {
  const src = rewriteBrokenMediaUrl(musicUrl) ?? musicUrl;
  if (!src) return null;
  return <Audio src={src} volume={volume} />;
};
