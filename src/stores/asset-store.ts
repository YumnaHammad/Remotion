import { create } from "zustand";
import type { MediaAsset } from "@/types";
import { genId } from "@/lib/project-factory";

interface AssetState {
  assets: MediaAsset[];
  addAsset: (asset: MediaAsset) => void;
  removeAsset: (id: string) => void;
}

/**
 * Session-scoped uploaded assets. Not persisted because uploads use
 * `URL.createObjectURL`, which produces blob URLs valid only for the current
 * page session. Swap for real storage (R2/Supabase) later without touching UI.
 */
export const useAssetStore = create<AssetState>((set) => ({
  assets: [],
  addAsset: (asset) => set((s) => ({ assets: [asset, ...s.assets] })),
  removeAsset: (id) =>
    set((s) => ({ assets: s.assets.filter((a) => a.id !== id) })),
}));

/** Build a MediaAsset (with a blob URL) from an uploaded File. */
export function assetFromFile(file: File): MediaAsset {
  const type: MediaAsset["type"] = file.type.startsWith("video")
    ? "video"
    : file.type.startsWith("audio")
      ? "audio"
      : file.type === "image/gif"
        ? "gif"
        : "image";

  return {
    id: genId("m"),
    name: file.name,
    type,
    url: URL.createObjectURL(file),
    size: file.size,
    createdAt: new Date().toISOString(),
    folder: "Uploads",
    tags: [],
  };
}
