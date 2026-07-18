"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  Palette,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
  FileDown,
  FileUp,
} from "lucide-react";
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
import { TemplatePreview } from "@/features/shared/template-preview";
import { ExportVideoButton } from "@/features/shared/export-video-button";
import { useBrandKit } from "@/hooks/use-brand-kit";
import { useBrandStore } from "@/stores/brand-store";
import {
  applyBrandToProps,
  downloadBrandLogo,
  exportBrandKitFile,
  parseBrandKitFile,
  readLogoAsDataUrl,
} from "@/utils/brand-defaults";
import { extractColorsFromImage } from "@/utils/extract-logo-colors";
import { toast } from "sonner";

const FONTS = ["Inter", "Space Grotesk", "Georgia", "Arial", "Helvetica"];
const ANIMATIONS = ["fade", "slide", "scale", "none"] as const;
const PREVIEW_COMPOSITION = "HelloWorld";

/**
 * Brand Kit — logo, colors, fonts, music.
 * Saved automatically to localStorage and applied to new videos.
 */
export function BrandKitFeature() {
  const { brand, updateBrand, setLogo, resetBrand } = useBrandKit();
  const logoRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const [hydrated, setHydrated] = useState(false);
  const [extracting, setExtracting] = useState(false);

  useEffect(() => {
    if (useBrandStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return useBrandStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  const previewProps = useMemo(
    () =>
      applyBrandToProps(
        {
          title: brand.name || "Your Brand",
          subtitle: "Preview how your brand looks on every video",
        },
        brand
      ),
    [brand]
  );

  const applyExtractedColors = async (
    dataUrl: string,
    message = "Colors extracted from logo"
  ) => {
    setExtracting(true);
    try {
      const colors = await extractColorsFromImage(dataUrl);
      updateBrand({ colors });
      toast.success(message);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not extract colors from logo"
      );
    } finally {
      setExtracting(false);
    }
  };

  const onLogoUpload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readLogoAsDataUrl(file);
      setLogo(dataUrl);
      await applyExtractedColors(dataUrl, "Logo saved — brand colors updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Logo upload failed");
    }
  };

  const clearLogo = () => {
    setLogo("");
    toast.success("Logo removed");
  };

  const onDownloadLogo = async () => {
    if (!brand.logoUrl) return;
    try {
      await downloadBrandLogo(brand.logoUrl, brand.name);
      toast.success("Logo downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed");
    }
  };

  const onExportBrandKit = () => {
    exportBrandKitFile(brand);
    toast.success("Brand kit exported");
  };

  const onImportBrandKit = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseBrandKitFile(JSON.parse(text) as unknown);
      if (!parsed) {
        toast.error("Invalid brand kit file");
        return;
      }
      updateBrand(parsed);
      if (parsed.logoUrl) setLogo(parsed.logoUrl);
      toast.success("Brand kit imported");
    } catch {
      toast.error("Could not read brand kit file");
    }
  };

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-5xl py-20 text-center text-sm text-muted-foreground">
        Loading brand kit…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Brand Kit</h1>
        <p className="text-sm text-muted-foreground">
          Logo, colors, fonts, and music — saved automatically and applied to
          every new video you create.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <section className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
            <Label>Brand name</Label>
            <Input
              value={brand.name}
              onChange={(e) => updateBrand({ name: e.target.value })}
              placeholder="Your company or channel name"
            />
          </section>

          <section className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
            <Label>Logo</Label>
            <input
              ref={logoRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={(e) => {
                void onLogoUpload(e.target.files);
                e.target.value = "";
              }}
            />
            <div className="flex flex-wrap items-center gap-4">
              {brand.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={brand.logoUrl}
                  alt="Brand logo"
                  className="h-16 w-16 rounded-lg border border-border bg-muted object-contain p-1"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-border bg-muted text-[10px] text-muted-foreground">
                  No logo
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => logoRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" /> Upload logo
                </Button>
                {brand.logoUrl && (
                  <>
                    <Button
                      variant="outline"
                      disabled={extracting}
                      onClick={() => void applyExtractedColors(brand.logoUrl!)}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      {extracting ? "Extracting…" : "Extract colors"}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={clearLogo}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, WebP, or SVG · max 512 KB · colors auto-extracted on upload
            </p>
          </section>

          <section className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Brand colors</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["primary", "Primary", "Titles & brand color"],
                  ["secondary", "Secondary", "Supporting elements"],
                  ["accent", "Accent", "Highlights & CTAs"],
                  ["background", "Background", "Scene background"],
                  ["text", "Text", "Body copy color"],
                ] as const
              ).map(([key, label, hint]) => (
                <div key={key} className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brand.colors[key]}
                    onChange={(e) =>
                      updateBrand({
                        colors: { ...brand.colors, [key]: e.target.value },
                      })
                    }
                    className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-border"
                    aria-label={label}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium">{label}</p>
                    <p className="truncate font-mono text-[10px] text-muted-foreground">
                      {brand.colors[key]}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{hint}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
            <Label>Font family</Label>
            <Select
              value={brand.fontFamily}
              onValueChange={(v) => updateBrand({ fontFamily: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONTS.map((f) => (
                  <SelectItem key={f} value={f}>
                    <span style={{ fontFamily: f }}>{f}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p
              className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
              style={{ fontFamily: brand.fontFamily }}
            >
              The quick brown fox jumps over the lazy dog
            </p>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 rounded-xl border border-border bg-card p-5 shadow-sm">
              <Label>Intro animation</Label>
              <Select
                value={brand.introAnimation}
                onValueChange={(v) =>
                  updateBrand({ introAnimation: v as typeof brand.introAnimation })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ANIMATIONS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 rounded-xl border border-border bg-card p-5 shadow-sm">
              <Label>Outro animation</Label>
              <Select
                value={brand.outroAnimation}
                onValueChange={(v) =>
                  updateBrand({ outroAnimation: v as typeof brand.outroAnimation })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ANIMATIONS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <section className="space-y-2 rounded-xl border border-border bg-card p-5 shadow-sm">
            <Label>Background music URL (optional)</Label>
            <Input
              placeholder="https://example.com/track.mp3"
              value={brand.musicUrl ?? ""}
              onChange={(e) =>
                updateBrand({ musicUrl: e.target.value || undefined })
              }
            />
            <p className="text-xs text-muted-foreground">
              Direct MP3 link — passed to templates that support audio.
            </p>
          </section>

          <section className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold">Export & import</h2>
            <p className="text-xs text-muted-foreground">
              Download your logo or export the full brand kit (colors, font, logo)
              as a JSON file. Import it later on another device.
            </p>
            <input
              ref={importRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                void onImportBrandKit(e.target.files);
                e.target.value = "";
              }}
            />
            <div className="flex flex-wrap gap-2">
              {brand.logoUrl && (
                <Button variant="outline" onClick={() => void onDownloadLogo()}>
                  <Download className="mr-2 h-4 w-4" /> Download logo
                </Button>
              )}
              <Button variant="glow" onClick={onExportBrandKit}>
                <FileDown className="mr-2 h-4 w-4" /> Export brand kit
              </Button>
              <Button variant="outline" onClick={() => importRef.current?.click()}>
                <FileUp className="mr-2 h-4 w-4" /> Import brand kit
              </Button>
            </div>
          </section>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={resetBrand}>
              <RotateCcw className="mr-2 h-4 w-4" /> Reset defaults
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Changes save automatically. Use &quot;Apply brand kit&quot; in the
            video editor to update an existing project.
          </p>
        </div>

        <section className="space-y-3 lg:sticky lg:top-6 lg:self-start">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Live preview</h2>
            <ExportVideoButton
              projectId={`brand-preview-${brand.id}`}
              projectName={`${brand.name} preview`}
              compositionId={PREVIEW_COMPOSITION}
              inputProps={previewProps as unknown as Record<string, unknown>}
              trigger={
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" /> Export preview MP4
                </Button>
              }
            />
          </div>
          <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-border bg-black/50 p-4 lg:min-h-[360px]">
            <TemplatePreview
              compositionId={PREVIEW_COMPOSITION}
              inputProps={previewProps as unknown as Record<string, unknown>}
              className="w-full max-w-md"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Preview uses the Hello World template. New videos inherit these
            colors, font, and logo automatically.
          </p>
        </section>
      </div>
    </div>
  );
}
