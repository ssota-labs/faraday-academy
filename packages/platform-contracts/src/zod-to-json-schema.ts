import type { z } from "zod";

/** Minimal Zod→JSON Schema exporter (no extra dependency). */
export function zodToJsonSchema(
  schema: z.ZodTypeAny,
  title: string,
): Record<string, unknown> {
  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    title,
    description: `Generated from Zod schema ${title}`,
    type: "object",
    additionalProperties: true,
    "x-faraday-contract": title,
  };
}
