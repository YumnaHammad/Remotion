"use client";

import { useMemo, useRef, useState } from "react";
import { Crown, Images, Search, Upload } from "lucide-react";
import { ASSET_CATEGORIES, ASSET_LIBRARY, type AssetCategory } from "@/data/assets-library";
import { PageHeader } from "@/components/studio/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectThumb } from "@/components/shared/primitives";
import { useAssetStore, assetFromFile } from "@/stores/asset-store";
import { MOCK_MEDIA } from "@/data/mock";
import { formatBytes, formatRelative } from "@/lib/utils";
import { toast } from "sonner";

/** Premium asset library + session uploads for use in videos. */
export function AssetLibraryFeature() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<AssetCategory | "all">("all");
  const uploaded = useAssetStore((s) => s.assets);
  const addAsset = useAssetStore((s) => s.addAsset);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    return ASSET_LIBRARY.filter((a) => {
      const matchCat = category === "all" || a.category === category;
      const q = query.toLowerCase();
      return (
        matchCat &&
        (!q || a.name.toLowerCase().includes(q) || a.category.includes(q))
      );
    });
  }, [query, category]);

  const media = [...uploaded, ...MOCK_MEDIA.filter((m) => m.type !== "audio")];

  const onUpload = (files: FileList | null) => {
    if (!files?.length) return;
    let n = 0;
    for (const f of Array.from(files)) {
      addAsset(assetFromFile(f));
      n++;
    }
    if (n) toast.success(`${n} asset${n > 1 ? "s" : ""} uploaded`);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Asset Library"
        description="Premium backgrounds, gradients, shapes, and charts — plus your uploaded images and videos."
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
                onUpload(e.target.files);
                e.target.value = "";
              }}
            />
            <Button variant="glow" onClick={() => inputRef.current?.click()}>
              <Upload className="h-4 w-4" /> Upload
            </Button>
          </>
        }
      />

      <Tabs defaultValue="premium">
        <TabsList>
          <TabsTrigger value="premium">Premium assets</TabsTrigger>
          <TabsTrigger value="uploads">My uploads ({uploaded.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="premium" className="mt-4 space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search assets…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Tabs
              value={category}
              onValueChange={(v) => setCategory(v as AssetCategory | "all")}
            >
              <TabsList className="h-auto flex-wrap justify-start">
                <TabsTrigger value="all" className="text-xs">
                  All ({ASSET_LIBRARY.length})
                </TabsTrigger>
                {ASSET_CATEGORIES.map((c) => {
                  const count = ASSET_LIBRARY.filter((a) => a.category === c.id).length;
                  return (
                    <TabsTrigger key={c.id} value={c.id} className="text-xs">
                      {c.label.split(" ")[0]} ({count})
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((asset) => (
              <div
                key={asset.id}
                className="overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/30"
              >
                <ProjectThumb gradient={asset.preview} className="aspect-video">
                  {asset.premium && (
                    <Badge className="absolute left-2 top-2 bg-amber-500/90 text-black">
                      <Crown className="mr-1 h-3 w-3" /> Pro
                    </Badge>
                  )}
                </ProjectThumb>
                <div className="p-3">
                  <p className="text-sm font-medium">{asset.name}</p>
                  <p className="text-[11px] capitalize text-muted-foreground">
                    {asset.category.replace("-", " ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="uploads" className="mt-4">
          {media.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
              Upload images or videos to use in timeline projects and gallery scenes.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {media.map((m) => {
                const preview = m.type === "image" || m.type === "gif";
                return (
                  <div
                    key={m.id}
                    className="overflow-hidden rounded-xl border border-border bg-card"
                  >
                    <div className="flex aspect-video items-center justify-center overflow-hidden bg-muted">
                      {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.url} alt={m.name} className="h-full w-full object-cover" />
                      ) : (
                        <Images className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="space-y-1 p-3">
                      <p className="truncate text-sm font-medium">{m.name}</p>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <Badge variant="secondary">{m.type}</Badge>
                        <span>{formatBytes(m.size)}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {formatRelative(m.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
