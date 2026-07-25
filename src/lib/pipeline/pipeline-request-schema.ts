import { z } from "zod";

export const pipelineRequestSchema = z.object({
  source: z.enum(["client", "server"]).optional(),
  useExternalApis: z.boolean().optional(),
});

export type PipelineRequestBody = z.infer<typeof pipelineRequestSchema>;

export function toPipelineOptions(body: PipelineRequestBody) {
  return {
    source: body.source,
    useExternalApis: body.useExternalApis,
  };
}
