"use client";

import { useRef } from "react";
import { Upload, RotateCcw } from "lucide-react";
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
import { useBrandKit } from "@/hooks/use-brand-kit";
import { toast } from "sonner";

const FONTS = ["Inter", "Space Grotesk", "Georgia", "Arial", "Helvetica"];
const ANIMATIONS = ["fade", "slide", "scale", "none"] as const;

/**
 * Brand Kit settings — saved to localStorage and applied to every video.
 */
export function BrandKitFeature() {
  const { brand, updateBrand, setLogo, resetBrand } = useBrandKit();
  const logoRef = useRef<HTMLInputElement>(null);

  const onLogoUpload = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLogo(url);
    toast.success("Logo uploaded");
  };

  const save = () => {
    toast.success("Brand kit saved — applied to all new videos");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Brand Kit</h1>
        <p className="text-sm text-muted-foreground">
          Logo, colors, fonts, and music — automatically applied to every video
          you generate.
        </p>
      </div>

      <section className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
        <Label>Brand name</Label>
        <Input
          value={brand.name}
          onChange={(e) => updateBrand({ name: e.target.value })}
        />
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
        <Label>Logo</Label>
        <input
          ref={logoRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            onLogoUpload(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="flex items-center gap-4">
          {brand.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={brand.logoUrl}
              alt="Logo"
              className="h-16 w-16 rounded-lg border border-border object-contain bg-muted p-1"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-border bg-muted text-xs text-muted-foreground">
              No logo
            </div>
          )}
          <Button variant="outline" onClick={() => logoRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" /> Upload logo
          </Button>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold">Brand colors</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["primary", "Primary"],
              ["secondary", "Secondary"],
              ["accent", "Accent"],
              ["background", "Background"],
              ["text", "Text"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex items-center gap-3">
              <input
                type="color"
                value={brand.colors[key]}
                onChange={(e) =>
                  updateBrand({
                    colors: { ...brand.colors, [key]: e.target.value },
                  })
                }
                className="h-10 w-10 cursor-pointer rounded-lg border border-border"
              />
              <div>
                <p className="text-xs font-medium">{label}</p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {brand.colors[key]}
                </p>
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
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          onChange={(e) => updateBrand({ musicUrl: e.target.value || undefined })}
        />
        <p className="text-xs text-muted-foreground">
          Direct link to an MP3 file. Used when templates support audio.
        </p>
      </section>

      <div className="flex gap-2">
        <Button variant="glow" onClick={save}>
          Save brand kit
        </Button>
        <Button variant="outline" onClick={resetBrand}>
          <RotateCcw className="mr-2 h-4 w-4" /> Reset defaults
        </Button>
      </div>
    </div>
  );
}
