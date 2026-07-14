import { z } from "zod";

export const PaymentStatusSchema = z.enum([
  "CREATED",
  "REQUIRES_ACTION",
  "SUCCEEDED",
  "FAILED",
  "REFUNDED",
  "DISPUTED",
]);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const OrderSchema = z.object({
  id: z.string().min(1),
  courseId: z.string().min(1),
  buyerId: z.string().min(1),
  amountCents: z.number().int().nonnegative(),
  currency: z.string().length(3),
  status: PaymentStatusSchema,
  provider: z.literal("stripe"),
  providerPaymentId: z.string().nullable(),
  entitlementId: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Order = z.infer<typeof OrderSchema>;

export const UsageMeterSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  courseId: z.string().min(1),
  kind: z.enum(["TUTOR_TOKENS", "STORAGE_BYTES", "EGRESS_BYTES", "BUILD_MINUTES"]),
  quantity: z.number().nonnegative(),
  occurredAt: z.string().datetime(),
});
export type UsageMeter = z.infer<typeof UsageMeterSchema>;
