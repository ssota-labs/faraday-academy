import { z } from "zod";

/**
 * UGC iframe may only emit interaction intents or request trusted overlays.
 * Session/API tokens must NEVER appear in this schema.
 */
export const UgcEmitInteractionSchema = z.object({
  eventId: z.string().min(1),
  type: z.string().min(1),
  nodeId: z.string().min(1).optional(),
  payload: z.unknown().optional(),
});
export type UgcEmitInteraction = z.infer<typeof UgcEmitInteractionSchema>;

export const TrustedSurfaceKindSchema = z.enum([
  "OFFICIAL_ASSESSMENT",
  "TUTOR",
  "COMMUNITY",
]);
export type TrustedSurfaceKind = z.infer<typeof TrustedSurfaceKindSchema>;

export const UgcRequestTrustedSurfaceSchema = z.object({
  kind: TrustedSurfaceKindSchema,
  resourceId: z.string().min(1).optional(),
});
export type UgcRequestTrustedSurface = z.infer<
  typeof UgcRequestTrustedSurfaceSchema
>;

export const UgcBridgeMessageSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("emitInteraction"),
    params: UgcEmitInteractionSchema,
  }),
  z.object({
    method: z.literal("requestTrustedSurface"),
    params: UgcRequestTrustedSurfaceSchema,
  }),
]);
export type UgcBridgeMessage = z.infer<typeof UgcBridgeMessageSchema>;

/** Forbidden keys that must never appear on UGC bridge payloads. */
export const UGC_FORBIDDEN_KEYS = [
  "session",
  "token",
  "accessToken",
  "refreshToken",
  "apiKey",
  "learnerId",
  "userId",
  "cookie",
  "authorization",
] as const;
