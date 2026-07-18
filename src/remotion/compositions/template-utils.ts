import type { TemplateProps } from "./templates-schema";

const DEFAULT_FONT = "Inter, system-ui, sans-serif";

export const templateDefaultProps: TemplateProps = {
  title: "LUMEN",
  subtitle: "Create without limits",
  accent: "#818cf8",
  brandColor: "#6366f1",
};

export type MergedTemplateProps = TemplateProps & {
  fontFamily: string;
  logoUrl?: string;
  musicUrl?: string;
};

/** Merge composition props with font + logo from brand kit. */
export function mergeTemplateProps(
  props: Partial<TemplateProps> & {
    fontFamily?: string;
    logoUrl?: string;
    musicUrl?: string;
  }
): MergedTemplateProps {
  const merged = { ...templateDefaultProps, ...props };
  return {
    ...merged,
    fontFamily: props.fontFamily
      ? `${props.fontFamily}, system-ui, sans-serif`
      : DEFAULT_FONT,
    logoUrl: props.logoUrl,
    musicUrl: props.musicUrl,
  };
}
