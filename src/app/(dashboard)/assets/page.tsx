"use client";

import { useRef } from "react";
import { Images, Music, Upload, Video } from "lucide-react";
import { PageHeader } from "@/components/studio/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_MEDIA } from "@/data/mock";
import { useAssetStore, assetFromFile } from "@/stores/asset-store";
import { formatBytes, formatRelative } from "@/lib/utils";
import { toast } from "sonner";

const ICONS = {
  image: Images,
  video: Video,
  audio: Music,
  gif: Images,
  font: Images,
};

export default function AssetsStudioPage() {
  const uploaded = useAssetStore((s) => s.assets);
  const addAsset = useAssetStore((s) => s.addAsset);
  const inputRef = useRef<HTMLInputElement>(null);
  const media = [...uploaded, ...MOCK_MEDIA];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Asset Studio"
        description="Images, video, GIF, audio, fonts — session uploads via createObjectURL for Remotion <Img/>, <Video/>, <Audio/>, <Gif/>."
        icon={Images}
        actions={
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/*,video/*,audio/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = e.target.files;
                if (!files) return;
                let n = 0;
                for (const f of Array.from(files)) {
                  addAsset(assetFromFile(f));
                  n++;
                }
                if (n) toast.success(`${n} asset${n > 1 ? "s" : ""} uploaded`);
                e.target.value = "";
              }}
            />
            <Button variant="glow" onClick={() => inputRef.current?.click()}>
              <Upload className="h-4 w-4" /> Upload
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {media.map((m) => {
          const Icon = ICONS[m.type];
          const preview = m.type === "image" || m.type === "gif";
          return (
            <div
              key={m.id}
              className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:border-primary/40"
            >
              <div className="flex aspect-video items-center justify-center overflow-hidden bg-muted">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.url}
                    alt={m.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Icon className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-2 p-3">
                <p className="truncate text-sm font-medium">{m.name}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{m.type}</Badge>
                  <span className="text-[11px] text-muted-foreground">
                    {formatBytes(m.size)}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {m.folder} · {formatRelative(m.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
