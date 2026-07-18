import { z } from "zod";
import { zColor } from "@remotion/zod-types";

/** Zod schema for Remotion Studio — server/CLI only, not imported by the Next.js client. */
export const templateSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  accent: zColor(),
  brandColor: zColor(),
});

export type TemplateProps = z.infer<typeof templateSchema>;
