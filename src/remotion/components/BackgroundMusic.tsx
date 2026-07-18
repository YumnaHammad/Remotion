import React from "react";
import { Audio } from "remotion";

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
  if (!musicUrl) return null;
  return <Audio src={musicUrl} volume={volume} />;
};
