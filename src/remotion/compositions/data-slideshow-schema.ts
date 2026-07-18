import { z } from "zod";
import { zColor } from "@remotion/zod-types";

/** Zod schema for DataSlideshow — Remotion CLI only. */
export const dataVideoSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  accent: zColor(),
  brandColor: zColor(),
  rows: z.array(z.record(z.string(), z.union([z.string(), z.number()]))),
  columns: z.array(z.string()),
  fontFamily: z.string().optional(),
  musicUrl: z.string().optional(),
});

export type DataVideoSchemaProps = z.infer<typeof dataVideoSchema>;
