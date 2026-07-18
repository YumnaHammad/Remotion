"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Music2, Pause, Play } from "lucide-react";
import { AUDIO_LIBRARY, type AudioTrack } from "@/data/audio-library";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface MusicPickerProps {
  value?: string;
  onChange: (url: string) => void;
  /** Show compact layout */
  compact?: boolean;
}

function findTrackByUrl(url: string): AudioTrack | undefined {
  return AUDIO_LIBRARY.find((t) => t.previewUrl === url);
}

/** Pick library track or paste custom URL — with live preview. */
export function MusicPicker({ value = "", onChange, compact }: MusicPickerProps) {
  const pathname = usePathname();
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const selectedTrack = value ? findTrackByUrl(value) : undefined;
  const selectValue = selectedTrack?.id ?? "custom";

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const stopPreview = () => {
    audioRef.current?.pause();
    setPlayingUrl(null);
  };

  const preview = (url: string) => {
    if (playingUrl === url) {
      stopPreview();
      return;
    }
    audioRef.current?.pause();
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play().catch(() => toast.error("Could not play preview"));
    audio.onended = () => setPlayingUrl(null);
    setPlayingUrl(url);
  };

  const pickTrack = (trackId: string) => {
    if (trackId === "none") {
      onChange("");
      stopPreview();
      return;
    }
    if (trackId === "custom") return;
    const track = AUDIO_LIBRARY.find((t) => t.id === trackId);
    if (!track) return;
    onChange(track.previewUrl);
    toast.success(`Selected "${track.name}"`);
  };

  const audioLibraryHref = pathname.startsWith("/create/")
    ? `/audio?returnTo=${encodeURIComponent(pathname)}`
    : "/audio";

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[180px] flex-1 space-y-2">
          <Label>Background music</Label>
          <Select value={selectValue} onValueChange={pickTrack}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a track" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No music</SelectItem>
              {AUDIO_LIBRARY.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name} ({t.duration})
                </SelectItem>
              ))}
              <SelectItem value="custom">Custom URL…</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {value && (
          <Button type="button" variant="outline" size="sm" onClick={() => preview(value)}>
            {playingUrl === value ? (
              <>
                <Pause className="mr-1 h-3.5 w-3.5" /> Stop
              </>
            ) : (
              <>
                <Play className="mr-1 h-3.5 w-3.5" /> Preview
              </>
            )}
          </Button>
        )}
      </div>

      {(selectValue === "custom" || (!selectedTrack && value)) && (
        <div className="space-y-2">
          <Label>Music URL</Label>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://remotion.media/lofi.mp3"
          />
        </div>
      )}

      {!compact && (
        <p className="text-xs text-muted-foreground">
          Browse the full library on{" "}
          <Link href={audioLibraryHref} className="text-primary hover:underline">
            Audio Library
          </Link>
          . Music plays in preview and export.
        </p>
      )}
    </div>
  );
}

/** Hook-friendly preview control for list rows. */
export function useAudioPreview() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    return () => audioRef.current?.pause();
  }, []);

  const toggle = (id: string, url: string) => {
    if (playingId === id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    audioRef.current?.pause();
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play().catch(() => toast.error("Could not play preview"));
    audio.onended = () => setPlayingId(null);
    setPlayingId(id);
  };

  const stop = () => {
    audioRef.current?.pause();
    setPlayingId(null);
  };

  return { playingId, toggle, stop };
}

export function MusicPickerIcon() {
  return <Music2 className="h-4 w-4" />;
}
