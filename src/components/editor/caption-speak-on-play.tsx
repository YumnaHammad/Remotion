"use client";

import { useEffect, useRef } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { captionsPlainText } from "@/lib/caption-editor";

/**
 * When enabled, speaks caption layers via the browser while the timeline plays.
 * Cancelled on pause / seek out of the clip.
 */
export function CaptionSpeakOnPlay({ enabled }: { enabled: boolean }) {
  const project = useEditorStore((s) => s.project);
  const currentFrame = useEditorStore((s) => s.currentFrame);
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const spokenClipRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }

    if (!isPlaying) {
      window.speechSynthesis.cancel();
      spokenClipRef.current = null;
      return;
    }

    const fps = project.settings.fps;
    const timeMs = (currentFrame / fps) * 1000;

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
    const text = captionsPlainText(active.captions ?? []);
    if (!text) return;

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
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
