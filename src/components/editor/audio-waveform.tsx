"use client";

import { useMemo } from "react";
import { useAudioData, getWaveformPortion } from "@remotion/media-utils";
import { cn } from "@/lib/utils";

/**
 * Real audio waveform for timeline clips via @remotion/media-utils.
 * Falls back to a synthetic pattern until the audio buffer resolves.
 */
export function AudioWaveform({
  src,
  bars = 40,
  className,
}: {
  src?: string;
  bars?: number;
  className?: string;
}) {
  const audioData = useAudioData(src ?? "");

  const amplitudes = useMemo(() => {
    if (!audioData) {
      return Array.from(
        { length: bars },
        (_, i) => 0.25 + Math.abs(Math.sin(i * 0.6)) * 0.6
      );
    }
    return getWaveformPortion({
      audioData,
      startTimeInSeconds: 0,
      durationInSeconds: audioData.durationInSeconds,
      numberOfSamples: bars,
    }).map((b) => Math.min(1, Math.abs(b.amplitude) * 1.6));
  }, [audioData, bars]);

  return (
    <div className={cn("flex h-full items-center gap-px", className)}>
      {amplitudes.map((a, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm bg-white/70"
          style={{ height: `${Math.max(8, a * 100)}%` }}
        />
      ))}
    </div>
  );
}
