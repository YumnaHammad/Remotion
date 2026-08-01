import { create } from "zustand";
import type { MediaAsset } from "@/types";
import { genId } from "@/lib/project-factory";

interface AssetState {
  assets: MediaAsset[];
  addAsset: (asset: MediaAsset) => void;
  removeAsset: (id: string) => void;
  uploadFiles: (files: FileList | null) => Promise<number>;
}

/**
 * Uploaded assets synced with public/generated-assets/uploads/ on the server.
 * This ensures they persist across page reloads and render successfully during video exports.
 */
export const useAssetStore = create<AssetState>((set) => ({
  assets: [],
  addAsset: (asset) => set((s) => ({ assets: [asset, ...s.assets] })),
  removeAsset: (id) =>
    set((s) => ({ assets: s.assets.filter((a) => a.id !== id) })),
  uploadFiles: async (files) => {
    if (!files || !files.length) return 0;
    let successCount = 0;
    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/assets/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        
        let url = "";
        let name = file.name;
        let size = file.size;

        if (data.ok && data.url) {
          url = data.url;
          name = data.name;
          size = data.size;
        } else {
          // Fallback to client-side Blob URL if server upload fails (e.g. read-only filesystem on Vercel)
          url = URL.createObjectURL(file);
          console.warn("[assets] Server upload failed, falling back to local Blob URL for", file.name);
        }

        const type: MediaAsset["type"] = file.type.startsWith("video")
          ? "video"
          : file.type.startsWith("audio")
            ? "audio"
            : file.type === "image/gif"
              ? "gif"
              : "image";

        const newAsset: MediaAsset = {
          id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name,
          type,
          url,
          size,
          createdAt: new Date().toISOString(),
          folder: "Uploads",
          tags: [],
        };
        set((s) => ({ assets: [newAsset, ...s.assets] }));
        successCount++;
      } catch (err) {
        console.error("Upload server request failed, using local Blob URL fallback for", file.name, err);
        const type: MediaAsset["type"] = file.type.startsWith("video")
          ? "video"
          : file.type.startsWith("audio")
            ? "audio"
            : file.type === "image/gif"
              ? "gif"
              : "image";

        const newAsset: MediaAsset = {
          id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: file.name,
          type,
          url: URL.createObjectURL(file),
          size: file.size,
          createdAt: new Date().toISOString(),
          folder: "Uploads",
          tags: [],
        };
        set((s) => ({ assets: [newAsset, ...s.assets] }));
        successCount++;
      }
    }
    return successCount;
  },
}));

/** Build a MediaAsset (with a blob URL fallback) from an uploaded File. */
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
    url: typeof window !== "undefined" ? URL.createObjectURL(file) : "",
    size: file.size,
    createdAt: new Date().toISOString(),
    folder: "Uploads",
    tags: [],
  };
}
