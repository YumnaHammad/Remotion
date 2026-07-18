import type { BrandSettings, VideoTemplateProps } from "@/types/video";

export const DEFAULT_BRAND: BrandSettings = {
  id: "brand-default",
  name: "My Brand",
  colors: {
    primary: "#0b84f3",
    secondary: "#6366f1",
    accent: "#22d3ee",
    background: "#0f1115",
    text: "#ffffff",
  },
  fontFamily: "Inter",
  introAnimation: "fade",
  outroAnimation: "fade",
};

/** Apply brand kit when creating a new video project. */
export function applyBrandToProps(
  props: Partial<VideoTemplateProps>,
  brand: BrandSettings
): VideoTemplateProps {
  return {
    title: props.title ?? brand.name,
    subtitle: props.subtitle ?? "Your subtitle here",
    accent: props.accent ?? brand.colors.accent,
    brandColor: props.brandColor ?? brand.colors.primary,
    fontFamily: props.fontFamily ?? brand.fontFamily,
    logoUrl: props.logoUrl ?? brand.logoUrl,
    ...(props.imageUrl ? { imageUrl: props.imageUrl } : {}),
    ...(props.musicUrl || brand.musicUrl
      ? { musicUrl: props.musicUrl ?? brand.musicUrl }
      : {}),
  };
}

/** Pull latest brand kit colors/fonts into an existing project draft. */
export function syncPropsFromBrand(
  props: VideoTemplateProps,
  brand: BrandSettings
): VideoTemplateProps {
  return {
    ...props,
    accent: brand.colors.accent,
    brandColor: brand.colors.primary,
    fontFamily: brand.fontFamily,
    logoUrl: brand.logoUrl ?? props.logoUrl,
    ...(brand.musicUrl ? { musicUrl: brand.musicUrl } : {}),
  };
}

/** Read uploaded logo as a data URL so it survives localStorage + page reload. */
export function readLogoAsDataUrl(
  file: File,
  maxBytes = 512_000
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > maxBytes) {
      reject(new Error("Logo must be under 512 KB"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read logo file"));
    };
    reader.onerror = () => reject(new Error("Could not read logo file"));
    reader.readAsDataURL(file);
  });
}

function slugifyName(name: string): string {
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "brand-kit";
}

/** Download the logo file from a data URL or remote URL. */
export async function downloadBrandLogo(
  logoUrl: string,
  brandName = "brand"
): Promise<void> {
  const slug = slugifyName(brandName);
  let href = logoUrl;
  let ext = "png";

  if (logoUrl.startsWith("data:image/")) {
    const match = /^data:image\/(\w+);/.exec(logoUrl);
    if (match?.[1]) ext = match[1] === "jpeg" ? "jpg" : match[1];
  } else {
    const res = await fetch(logoUrl);
    if (!res.ok) throw new Error("Could not download logo");
    const blob = await res.blob();
    href = URL.createObjectURL(blob);
    ext = blob.type.includes("svg") ? "svg" : blob.type.includes("jpeg") ? "jpg" : "png";
  }

  const a = document.createElement("a");
  a.href = href;
  a.download = `${slug}-logo.${ext}`;
  a.click();

  if (href !== logoUrl) URL.revokeObjectURL(href);
}

/** Export brand kit settings (+ embedded logo) as JSON. */
export function exportBrandKitFile(brand: BrandSettings): void {
  const payload = {
    version: 1,
    app: "framekit",
    exportedAt: new Date().toISOString(),
    brand: {
      name: brand.name,
      colors: brand.colors,
      fontFamily: brand.fontFamily,
      introAnimation: brand.introAnimation,
      outroAnimation: brand.outroAnimation,
      musicUrl: brand.musicUrl,
      logoUrl: brand.logoUrl,
    },
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slugifyName(brand.name)}-brand-kit.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Import brand kit from an exported JSON file. */
export function parseBrandKitFile(
  json: unknown
): Partial<BrandSettings> | null {
  if (!json || typeof json !== "object") return null;
  const root = json as { brand?: Partial<BrandSettings> };
  const b = root.brand;
  if (!b || typeof b !== "object") return null;

  const colors = b.colors;
  if (
    !colors ||
    typeof colors.primary !== "string" ||
    typeof colors.secondary !== "string" ||
    typeof colors.accent !== "string" ||
    typeof colors.background !== "string" ||
    typeof colors.text !== "string"
  ) {
    return null;
  }

  return {
    name: typeof b.name === "string" ? b.name : undefined,
    colors,
    fontFamily: typeof b.fontFamily === "string" ? b.fontFamily : undefined,
    introAnimation: b.introAnimation,
    outroAnimation: b.outroAnimation,
    musicUrl: typeof b.musicUrl === "string" ? b.musicUrl : undefined,
    logoUrl: typeof b.logoUrl === "string" ? b.logoUrl : undefined,
  };
}
