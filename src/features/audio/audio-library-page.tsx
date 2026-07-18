"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Crown, Music, Pause, Play, Search, Upload } from "lucide-react";
import {
  AUDIO_CATEGORIES,
  AUDIO_LIBRARY,
  type AudioCategory,
  type AudioTrack,
} from "@/data/audio-library";
import { PageHeader } from "@/components/studio/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAudioPreview } from "@/features/shared/music-picker";
import { useBrandKit } from "@/hooks/use-brand-kit";
import { useAssetStore, assetFromFile } from "@/stores/asset-store";
import { MOCK_MEDIA, SAMPLE_AUDIO } from "@/data/mock";
import { formatBytes } from "@/lib/utils";
import { toast } from "sonner";

/** Audio library — preview tracks, set brand music, upload custom audio. */
export function AudioLibraryFeature() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const { brand, updateBrand } = useBrandKit();
  const uploaded = useAssetStore((s) => s.assets);
  const addAsset = useAssetStore((s) => s.addAsset);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<AudioCategory | "all">("all");
  const { playingId, toggle } = useAudioPreview();

  const uploadedAudio = useMemo(
    () => uploaded.filter((a) => a.type === "audio"),
    [uploaded]
  );

  const filtered = useMemo(() => {
    return AUDIO_LIBRARY.filter((t) => {
      const matchCat = category === "all" || t.category === category;
      const q = query.toLowerCase();
      return matchCat && (!q || t.name.toLowerCase().includes(q));
    });
  }, [query, category]);

  const applyTrack = (track: AudioTrack | { name: string; previewUrl: string }) => {
    updateBrand({ musicUrl: track.previewUrl });
    toast.success(`"${track.name}" set as default brand music`);
    if (returnTo) router.push(returnTo);
  };

  const onUpload = (files: FileList | null) => {
    if (!files?.length) return;
    let count = 0;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("audio")) continue;
      addAsset(assetFromFile(file));
      count++;
    }
    if (count) toast.success(`${count} audio file${count > 1 ? "s" : ""} uploaded`);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Audio Library"
        description="Preview corporate, cinematic, social, and podcast tracks. Set default music for all new videos."
        icon={Music}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/projects">Timeline audio mixer</Link>
          </Button>
        }
      />

      {brand.musicUrl && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div>
            <p className="text-sm font-medium">Current brand music</p>
            <p className="truncate text-xs text-muted-foreground">{brand.musicUrl}</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => toggle("brand", brand.musicUrl!)}>
            {playingId === "brand" ? (
              <>
                <Pause className="mr-1 h-3.5 w-3.5" /> Stop
              </>
            ) : (
              <>
                <Play className="mr-1 h-3.5 w-3.5" /> Preview
              </>
            )}
          </Button>
        </div>
      )}

      <Tabs defaultValue="library">
        <TabsList>
          <TabsTrigger value="library">Music library</TabsTrigger>
          <TabsTrigger value="uploads">
            My uploads ({uploadedAudio.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="mt-4 space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search tracks…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Tabs
              value={category}
              onValueChange={(v) => setCategory(v as AudioCategory | "all")}
            >
              <TabsList className="h-auto flex-wrap justify-start">
                <TabsTrigger value="all" className="text-xs">
                  All
                </TabsTrigger>
                {AUDIO_CATEGORIES.map((c) => (
                  <TabsTrigger key={c.id} value={c.id} className="text-xs">
                    {c.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="divide-y divide-border rounded-xl border border-border bg-card">
            {filtered.map((track) => (
              <AudioRow
                key={track.id}
                track={track}
                isPlaying={playingId === track.id}
                isActive={brand.musicUrl === track.previewUrl}
                onPreview={() => toggle(track.id, track.previewUrl)}
                onUse={() => applyTrack(track)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="uploads" className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <label>
              <input
                type="file"
                accept="audio/*"
                multiple
                className="hidden"
                onChange={(e) => onUpload(e.target.files)}
              />
              <Button variant="glow" asChild>
                <span>
                  <Upload className="mr-2 h-4 w-4" /> Upload audio
                </span>
              </Button>
            </label>
            <Button
              variant="outline"
              onClick={() => applyTrack({ name: "Sample lofi", previewUrl: SAMPLE_AUDIO })}
            >
              Use sample track
            </Button>
          </div>

          <div className="divide-y divide-border rounded-xl border border-border bg-card">
            {uploadedAudio.length === 0 && (
              <p className="p-6 text-center text-sm text-muted-foreground">
                No uploads yet. MP3/WAV files appear here and can be set as brand music.
              </p>
            )}
            {uploadedAudio.map((asset) => (
              <div
                key={asset.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div>
                  <p className="font-medium">{asset.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Upload · {formatBytes(asset.size)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggle(asset.id, asset.url)}
                  >
                    {playingId === asset.id ? "Stop" : "Preview"}
                  </Button>
                  <Button size="sm" onClick={() => applyTrack({ name: asset.name, previewUrl: asset.url })}>
                    Use in videos
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {MOCK_MEDIA.filter((m) => m.type === "audio").map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-lg border border-dashed border-border p-3 text-sm"
            >
              <span>{m.name} (demo)</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => applyTrack({ name: m.name, previewUrl: m.url })}
              >
                Use
              </Button>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AudioRow({
  track,
  isPlaying,
  isActive,
  onPreview,
  onUse,
}: {
  track: AudioTrack;
  isPlaying: boolean;
  isActive: boolean;
  onPreview: () => void;
  onUse: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium">{track.name}</p>
          {track.premium && (
            <Badge className="bg-amber-500/90 text-black">
              <Crown className="mr-1 h-3 w-3" /> Pro
            </Badge>
          )}
          {isActive && <Badge variant="secondary">Brand default</Badge>}
        </div>
        <p className="text-xs text-muted-foreground">
          {AUDIO_CATEGORIES.find((c) => c.id === track.category)?.label} ·{" "}
          {track.duration}
        </p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onPreview}>
          {isPlaying ? (
            <>
              <Pause className="mr-1 h-3.5 w-3.5" /> Stop
            </>
          ) : (
            <>
              <Play className="mr-1 h-3.5 w-3.5" /> Preview
            </>
          )}
        </Button>
        <Button size="sm" onClick={onUse}>
          Use in videos
        </Button>
      </div>
    </div>
  );
}
