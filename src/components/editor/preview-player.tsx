"use client";

import { Player, type PlayerRef } from "@remotion/player";
import { useEffect, useRef } from "react";
import { MainComposition } from "@/remotion/compositions/MainComposition";
import { useEditorStore } from "@/stores/editor-store";

export function PreviewPlayer() {
  const playerRef = useRef<PlayerRef>(null);
  const project = useEditorStore((s) => s.project);
  const currentFrame = useEditorStore((s) => s.currentFrame);
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const setFrame = useEditorStore((s) => s.setFrame);
  const setPlaying = useEditorStore((s) => s.setPlaying);
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

    player.addEventListener("frameupdate", onFrame);
    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);
    return () => {
      player.removeEventListener("frameupdate", onFrame);
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
    };
  }, [setFrame, setPlaying, project.id]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    if (isPlaying) player.play();
    else player.pause();
  }, [isPlaying]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || isPlaying) return;
    if (player.getCurrentFrame() === currentFrame) return;
    seekingRef.current = true;
    player.seekTo(currentFrame);
    seekingRef.current = false;
  }, [currentFrame, isPlaying]);

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
      </div>
    </div>
  );
}
