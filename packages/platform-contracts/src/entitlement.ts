import { z } from "zod";

export const EntitlementStatusSchema = z.enum([
  "PENDING",
  "ACTIVE",
  "EXPIRED",
  "REVOKED",
  "REFUNDED",
  "DISPUTED",
]);
export type EntitlementStatus = z.infer<typeof EntitlementStatusSchema>;

export const EntitlementSourceSchema = z.enum([
  "FREE_GRANT",
  "GUEST_SIGNED",
  "PURCHASE",
  "ADMIN",
  "MIGRATION",
]);
export type EntitlementSource = z.infer<typeof EntitlementSourceSchema>;

export const EntitlementSchema = z.object({
  id: z.string().min(1),
  courseId: z.string().min(1),
  userId: z.string().nullable(),
  status: EntitlementStatusSchema,
  source: EntitlementSourceSchema,
  providerReference: z.string().nullable(),
  startsAt: z.string().datetime(),
  expiresAt: z.string().datetime().nullable(),
  reason: z.string().nullable(),
  createdAt: z.string().datetime(),
});
export type Entitlement = z.infer<typeof EntitlementSchema>;

export const GuestGrantClaimsSchema = z.object({
  courseId: z.string().min(1),
  releaseId: z.string().min(1),
  exp: z.number().int(),
  iat: z.number().int(),
  typ: z.literal("guest_grant"),
});
export type GuestGrantClaims = z.infer<typeof GuestGrantClaimsSchema>;
