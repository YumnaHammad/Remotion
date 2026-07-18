import { z } from "zod";
import { zColor } from "@remotion/zod-types";

/** Zod schema for Remotion CLI — server-only, not imported by the Next.js client. */
export const templateSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  accent: zColor(),
  brandColor: zColor(),
  fontFamily: z.string().optional(),
  logoUrl: z.string().optional(),
  musicUrl: z.string().optional(),
});

export type TemplateProps = z.infer<typeof templateSchema>;
