export type AssetCategory =
  | "backgrounds"
  | "gradients"
  | "shapes"
  | "decorations"
  | "icons"
  | "particles"
  | "charts";

export interface AssetItem {
  id: string;
  name: string;
  category: AssetCategory;
  preview: string;
  /** CSS gradient, color token, or SVG path */
  value: string;
  premium?: boolean;
}

export const ASSET_CATEGORIES: { id: AssetCategory; label: string }[] = [
  { id: "backgrounds", label: "Animated backgrounds" },
  { id: "gradients", label: "Gradient packs" },
  { id: "shapes", label: "Shape packs" },
  { id: "decorations", label: "Decorative elements" },
  { id: "icons", label: "Icons" },
  { id: "particles", label: "Particle effects" },
  { id: "charts", label: "Animated charts" },
];

export const ASSET_LIBRARY: AssetItem[] = [
  { id: "bg-mesh", name: "Mesh gradient", category: "backgrounds", preview: "gradient-hero", value: "gradient-hero" },
  { id: "bg-grid", name: "Dark grid", category: "backgrounds", preview: "gradient-corporate", value: "gradient-corporate" },
  { id: "bg-aurora", name: "Aurora wave", category: "backgrounds", preview: "gradient-cool", value: "gradient-cool", premium: true },
  { id: "bg-social", name: "Social burst", category: "backgrounds", preview: "gradient-social", value: "gradient-social" },
  { id: "grad-ocean", name: "Ocean blue", category: "gradients", preview: "gradient-cool", value: "linear-gradient(160deg, #0c4a6e, #6366f1)" },
  { id: "grad-sunset", name: "Sunset", category: "gradients", preview: "gradient-warm", value: "linear-gradient(160deg, #1a0a2e, #c2410c)" },
  { id: "grad-midnight", name: "Midnight", category: "gradients", preview: "gradient-corporate", value: "linear-gradient(160deg, #111827, #374151)" },
  { id: "grad-brand", name: "Brand hero", category: "gradients", preview: "gradient-hero", value: "gradient-hero" },
  { id: "shape-circle", name: "Soft circle", category: "shapes", preview: "#6366f1", value: "circle" },
  { id: "shape-ring", name: "Accent ring", category: "shapes", preview: "#0b84f3", value: "ring" },
  { id: "shape-blob", name: "Organic blob", category: "shapes", preview: "#ec4899", value: "blob", premium: true },
  { id: "deco-line", name: "Divider line", category: "decorations", preview: "#94a3b8", value: "line" },
  { id: "deco-dots", name: "Dot pattern", category: "decorations", preview: "#64748b", value: "dots" },
  { id: "deco-frame", name: "Photo frame", category: "decorations", preview: "#cbd5e1", value: "frame" },
  { id: "icon-chart", name: "Chart up", category: "icons", preview: "#22c55e", value: "chart-up" },
  { id: "icon-users", name: "Users", category: "icons", preview: "#0b84f3", value: "users" },
  { id: "icon-star", name: "Star rating", category: "icons", preview: "#fbbf24", value: "star" },
  { id: "part-sparkle", name: "Sparkle field", category: "particles", preview: "#fff", value: "sparkle", premium: true },
  { id: "part-confetti", name: "Confetti", category: "particles", preview: "#ec4899", value: "confetti" },
  { id: "part-dust", name: "Floating dust", category: "particles", preview: "#94a3b8", value: "dust" },
  { id: "chart-bar", name: "Bar chart", category: "charts", preview: "#0b84f3", value: "bar" },
  { id: "chart-line", name: "Line chart", category: "charts", preview: "#22c55e", value: "line-chart" },
  { id: "chart-donut", name: "Donut chart", category: "charts", preview: "#8b5cf6", value: "donut", premium: true },
  { id: "chart-area", name: "Area chart", category: "charts", preview: "#06b6d4", value: "area" },
];
