"use client";

import { useEffect, useRef } from "react";
import { useEditorStore } from "@/stores/editor-store";

/**
 * When enabled, speaks caption layers via the browser while the timeline plays.
 * Cancelled on pause / seek out of the clip.
 */
export function CaptionSpeakOnPlay({ enabled }: { enabled: boolean }) {
  const project = useEditorStore((s) => s.project);
  const currentFrame = useEditorStore((s) => s.currentFrame);
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const spokenClipRef = useRef<string | null>(null);
  const lastFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }

    const fps = project.settings.fps;
    const frame = currentFrame;
    const didSeek = Math.abs(frame - lastFrameRef.current) > 4;
    lastFrameRef.current = frame;

    if (!isPlaying) {
      window.speechSynthesis.cancel();
      spokenClipRef.current = null;
      return;
    }

    if (didSeek) {
      window.speechSynthesis.cancel();
      spokenClipRef.current = null;
    }

    const timeMs = (frame / fps) * 1000;

    const active = project.layers.find((layer) => {
      if (layer.type !== "caption" || !layer.captions?.length) return false;
      const startMs = (layer.startFrame / fps) * 1000;
      const endMs = startMs + (layer.durationInFrames / fps) * 1000;
      return timeMs >= startMs && timeMs < endMs;
    });

    if (!active) {
      if (spokenClipRef.current) {
        window.speechSynthesis.cancel();
        spokenClipRef.current = null;
      }
      return;
    }

    if (spokenClipRef.current === active.id) return;

    window.speechSynthesis.cancel();
    spokenClipRef.current = active.id;

    const layerStartMs = (active.startFrame / fps) * 1000;
    const elapsedMsInLayer = timeMs - layerStartMs;

    // Filter to speak only remaining captions in this layer (supports mid-scene plays and seeks)
    const remainingCaptions = (active.captions ?? []).filter((c) => c.endMs > elapsedMsInLayer);
    const textToSpeak = remainingCaptions.map((c) => c.text).join(" ").trim();
    if (!textToSpeak) return;

    const utter = new SpeechSynthesisUtterance(textToSpeak);

    // Calculate target WPM to speak exactly within the remaining layer duration
    const layerDurationMs = (active.durationInFrames / fps) * 1000;
    const remainingDurationSec = (layerDurationMs - elapsedMsInLayer) / 1000;
    
    if (remainingDurationSec > 0.5) {
      const targetWpm = (remainingCaptions.length / remainingDurationSec) * 60;
      const rate = Math.min(1.3, Math.max(0.85, targetWpm / 150));
      utter.rate = rate;
    } else {
      utter.rate = 1.0;
    }

    window.speechSynthesis.speak(utter);
  }, [
    enabled,
    isPlaying,
    currentFrame,
    project.layers,
    project.settings.fps,
  ]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  return null;
}
