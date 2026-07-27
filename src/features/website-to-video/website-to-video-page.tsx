"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TEMPLATE_CATALOG } from "@/templates/catalog";
import { TemplatePreview } from "@/features/shared/template-preview";
import { useBrandKit } from "@/hooks/use-brand-kit";
import { useSimpleVideoStore } from "@/stores/simple-video-store";
import {
  createProjectFromTemplate,
  propsFromWebsite,
} from "@/utils/video-project-factory";
import type { UrlMetadata } from "@/types/video";
import { toast } from "sonner";

/**
 * Website → Video flow:
 * 1. Paste URL → fetch metadata
 * 2. Pick template → live preview
 * 3. Continue to create workflow / export
 */
export function WebsiteToVideoFeature() {
  const router = useRouter();
  const { brand } = useBrandKit();
  const addProject = useSimpleVideoStore((s) => s.addProject);

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<UrlMetadata | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    TEMPLATE_CATALOG.find((t) => t.useCases.includes("website"))?.id ?? "tpl-5"
  );

  const websiteTemplates = TEMPLATE_CATALOG.filter((t) =>
    t.useCases.includes("website")
  );

  const selectedTemplate =
    TEMPLATE_CATALOG.find((t) => t.id === selectedTemplateId) ?? websiteTemplates[0]!;

  const previewProps = metadata
    ? propsFromWebsite(metadata, brand)
    : {
        title: "Your Website Title",
        subtitle: "Description from your page will appear here",
        accent: brand.colors.accent,
        brandColor: brand.colors.primary,
        fontFamily: brand.fontFamily,
      };

  const fetchMetadata = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        metadata?: UrlMetadata;
        error?: string;
      };
      if (!data.ok || !data.metadata) {
        toast.error(data.error ?? "Could not read that URL");
        return;
      }
      setMetadata(data.metadata);
      toast.success("Website info loaded");
    } catch {
      toast.error("Failed to fetch URL");
    } finally {
      setLoading(false);
    }
  };

  const createVideo = () => {
    // Generate custom scenes from website metadata if available
    let customScenes = undefined;
    if (metadata) {
      const fps = selectedTemplate.fps || 30;
      customScenes = [
        {
          id: `s-intro-${Date.now()}`,
          type: "intro",
          title: metadata.title.slice(0, 45),
          subtitle: metadata.siteName || "Web Presentation",
          durationInFrames: 4 * fps,
          animation: "slide",
        },
        {
          id: `s-content-${Date.now()}`,
          type: "content",
          title: "Overview",
          subtitle: metadata.description.slice(0, 160) || "Explore details on our website",
          durationInFrames: 6 * fps,
          animation: "fade",
          imageUrl: metadata.image || undefined,
        },
        ...(metadata.image
          ? [
              {
                id: `s-gallery-${Date.now()}`,
                type: "gallery",
                title: "Visual Preview",
                subtitle: "Page snapshot",
                durationInFrames: 5 * fps,
                animation: "zoom",
                images: [metadata.image],
              },
            ]
          : []),
        {
          id: `s-outro-${Date.now()}`,
          type: "outro",
          title: "Learn More",
          subtitle: metadata.url.replace(/^https?:\/\/(www\.)?/, ""),
          durationInFrames: 4 * fps,
          animation: "slide",
        },
      ];
    }

    const project = createProjectFromTemplate(
      selectedTemplate,
      brand,
      {
        ...(metadata ? propsFromWebsite(metadata, brand) : {}),
        ...(customScenes ? { scenes: customScenes } : {}),
      },
      {
        name: metadata?.title.slice(0, 60) ?? "Website Video",
        sourceType: "website",
      }
    );
    if (metadata) project.sourceUrl = metadata.url;
    addProject(project);
    toast.success("Video project created from website");
    router.push(`/create/${project.id}`);
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <div>
          <Badge className="mb-2">Website to Video</Badge>
          <h1 className="text-2xl font-semibold tracking-tight">
            Turn any webpage into a video
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Paste a product, blog, or portfolio URL. We extract the title,
            description, and image — then you pick a template.
          </p>
        </div>

        <div className="space-y-3 rounded-xl border border-border/50 bg-card/45 backdrop-blur-md p-5 shadow-sm">
          <Label htmlFor="url">Website URL</Label>
          <div className="flex gap-2">
            <Input
              id="url"
              placeholder="https://your-site.com/product"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchMetadata()}
            />
            <Button onClick={fetchMetadata} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Globe className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {metadata && (
          <div className="space-y-2 rounded-xl border border-border/50 bg-card/45 backdrop-blur-md p-5 shadow-sm">
            <p className="text-sm font-medium">{metadata.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-3">
              {metadata.description}
            </p>
            {metadata.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={metadata.image}
                alt=""
                className="mt-2 max-h-32 rounded-lg object-cover"
              />
            )}
          </div>
        )}

        <div className="space-y-3">
          <Label>Choose template</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {websiteTemplates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTemplateId(t.id)}
                className={`rounded-lg border p-3 text-left text-sm transition-all duration-200 ${
                  selectedTemplateId === t.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/60 hover:border-primary/30"
                }`}
              >
                <p className="font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="glow" onClick={createVideo} disabled={!metadata}>
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button asChild variant="outline">
            <Link href="/showcase">Browse all templates</Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-center rounded-xl border border-border bg-black/40 p-4">
        <TemplatePreview
          compositionId={selectedTemplate.compositionId}
          inputProps={previewProps as unknown as Record<string, unknown>}
          className="w-full max-w-lg"
        />
      </div>
    </div>
  );
}
