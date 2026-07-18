"use client";

import { Headphones, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useEditorStore } from "@/stores/editor-store";

export function AudioMixer() {
  const tracks = useEditorStore((s) => s.project.tracks);
  const masterVolume = useEditorStore((s) => s.project.masterVolume ?? 1);
  const updateTrack = useEditorStore((s) => s.updateTrack);
  const setMasterVolume = useEditorStore((s) => s.setMasterVolume);

  const audioTracks = tracks.filter((t) => t.kind === "audio");

  return (
    <div className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-3">
      <div className="flex items-center gap-2">
        <Headphones className="h-3.5 w-3.5 text-amber-400" />
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
          Audio mixer
        </p>
      </div>

      {audioTracks.length === 0 && (
        <p className="text-[11px] text-white/40">No audio tracks yet.</p>
      )}

      {audioTracks.map((track) => (
        <div key={track.id} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="truncate text-xs text-white/70">{track.name}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                title="Solo"
                onClick={() => updateTrack(track.id, { solo: !track.solo })}
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold transition",
                  track.solo
                    ? "bg-amber-400 text-black"
                    : "bg-white/10 text-white/50 hover:text-white"
                )}
              >
                S
              </button>
              <button
                type="button"
                title="Mute"
                onClick={() => updateTrack(track.id, { muted: !track.muted })}
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded transition",
                  track.muted
                    ? "bg-red-500/80 text-white"
                    : "bg-white/10 text-white/50 hover:text-white"
                )}
              >
                {track.muted ? (
                  <VolumeX className="h-3 w-3" />
                ) : (
                  <Volume2 className="h-3 w-3" />
                )}
              </button>
            </div>
          </div>
          <Slider
            value={[track.volume ?? 1]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={([v]) => updateTrack(track.id, { volume: v })}
          />
        </div>
      ))}

      <div className="space-y-1.5 border-t border-white/10 pt-3">
        <Label className="text-white/60">
          Master · {Math.round(masterVolume * 100)}%
        </Label>
        <Slider
          value={[masterVolume]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={([v]) => setMasterVolume(v)}
        />
      </div>
    </div>
  );
}
