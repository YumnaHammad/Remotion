"use client";

import { Player, type PlayerRef } from "@remotion/player";
import { useEffect, useRef } from "react";
import { MainComposition } from "@/remotion/compositions/MainComposition";
import { CanvasTransformOverlay } from "@/components/editor/canvas-transform-overlay";
import { useEditorStore } from "@/stores/editor-store";

export function PreviewPlayer() {
  const playerRef = useRef<PlayerRef>(null);
  const project = useEditorStore((s) => s.project);
  const currentFrame = useEditorStore((s) => s.currentFrame);
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const setFrame = useEditorStore((s) => s.setFrame);
  const setPlaying = useEditorStore((s) => s.setPlaying);
  const selectedLayerIds = useEditorStore((s) => s.selectedLayerIds);
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const { width, height, fps, durationInFrames } = project.settings;
  const seekingRef = useRef(false);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onFrame = (e: { detail: { frame: number } }) => {
      if (!seekingRef.current) setFrame(e.detail.frame);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);

    player.addEventListener("frameupdate", onFrame);
    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);
    player.addEventListener("ended", onEnded);
    return () => {
      player.removeEventListener("frameupdate", onFrame);
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
      player.removeEventListener("ended", onEnded);
    };
  }, [setFrame, setPlaying, project.id]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    try {
      if (isPlaying) {
        void player.play();
      } else {
        player.pause();
      }
    } catch {
      setPlaying(false);
    }
  }, [isPlaying, setPlaying]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    if (player.getCurrentFrame() === currentFrame) return;
    seekingRef.current = true;
    player.seekTo(currentFrame);
    // Keep seeking flag until after Remotion emits frameupdate for this seek
    const id = requestAnimationFrame(() => {
      seekingRef.current = false;
    });
    return () => cancelAnimationFrame(id);
  }, [currentFrame]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      const layer = project.layers.find((l) => l.id === selectedLayerIds[0]);
      if (!layer || layer.locked) return;
      const step = e.shiftKey ? 10 : 2;
      let dx = 0;
      let dy = 0;
      if (e.key === "ArrowLeft") dx = -step;
      if (e.key === "ArrowRight") dx = step;
      if (e.key === "ArrowUp") dy = -step;
      if (e.key === "ArrowDown") dy = step;
      if (!dx && !dy) return;
      e.preventDefault();
      updateLayer(layer.id, {
        transform: {
          ...layer.transform,
          x: layer.transform.x + dx,
          y: layer.transform.y + dy,
        },
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [project.layers, selectedLayerIds, updateLayer]);

  return (
    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(ellipse_at_center,#151822_0%,#050608_70%)] p-4">
      <div
        className="relative overflow-hidden rounded-lg shadow-2xl shadow-black/60 ring-1 ring-white/10"
        style={{
          aspectRatio: `${width} / ${height}`,
          maxHeight: "100%",
          maxWidth: "100%",
          width: height > width ? "auto" : "100%",
          height: height > width ? "100%" : "auto",
        }}
      >
        <Player
          ref={playerRef}
          component={MainComposition}
          inputProps={{ project }}
          durationInFrames={durationInFrames}
          compositionWidth={width}
          compositionHeight={height}
          fps={fps}
          style={{ width: "100%", height: "100%" }}
          controls={false}
          loop
          clickToPlay={false}
          spaceKeyToPlayOrPause={false}
          acknowledgeRemotionLicense
          errorFallback={({ error }) => (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: 24,
                background: "#0b0c0f",
                color: "#fca5a5",
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fecaca" }}>
                Preview failed
              </div>
              <div style={{ fontSize: 11, color: "#9ca3af", maxWidth: 360 }}>
                {error.message}
              </div>
            </div>
          )}
        />
        <CanvasTransformOverlay width={width} height={height} />
      </div>
    </div>
  );
}
