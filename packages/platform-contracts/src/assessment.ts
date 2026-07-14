import { z } from "zod";

export const AssessmentModeSchema = z.enum(["PRACTICE", "OFFICIAL"]);
export type AssessmentMode = z.infer<typeof AssessmentModeSchema>;

export const AssessmentItemSchema = z.object({
  itemId: z.string().min(1),
  prompt: z.string().min(1),
  choices: z.array(z.string()).optional(),
  publicItemHash: z.string().regex(/^[a-f0-9]{64}$/),
});
export type AssessmentItem = z.infer<typeof AssessmentItemSchema>;

export const AssessmentDefinitionSchema = z.object({
  assessmentId: z.string().min(1),
  assessmentVersionId: z.string().min(1),
  mode: AssessmentModeSchema,
  title: z.string().min(1),
  items: z.array(AssessmentItemSchema).min(1),
  maxAttempts: z.number().int().positive().optional(),
  timeLimitSeconds: z.number().int().positive().optional(),
});
export type AssessmentDefinition = z.infer<typeof AssessmentDefinitionSchema>;

export const SealedGradingKeySchema = z.object({
  assessmentVersionId: z.string().min(1),
  gradingKeyHash: z.string().regex(/^[a-f0-9]{64}$/),
  answers: z.record(z.string(), z.unknown()),
  passThreshold: z.number().min(0).max(1).default(0.7),
});
export type SealedGradingKey = z.infer<typeof SealedGradingKeySchema>;

export const AttemptStatusSchema = z.enum([
  "NOT_STARTED",
  "IN_PROGRESS",
  "SUBMITTED",
  "GRADED",
  "EXPIRED",
]);
export type AttemptStatus = z.infer<typeof AttemptStatusSchema>;

export const AssessmentAttemptSchema = z.object({
  id: z.string().min(1),
  assessmentId: z.string().min(1),
  assessmentVersionId: z.string().min(1),
  courseId: z.string().min(1),
  courseVersionId: z.string().min(1),
  learnerId: z.string().min(1),
  status: AttemptStatusSchema,
  itemOrder: z.array(z.string()),
  responses: z.record(z.string(), z.unknown()).default({}),
  score: z.number().min(0).max(1).nullable(),
  passed: z.boolean().nullable(),
  startedAt: z.string().datetime(),
  submittedAt: z.string().datetime().nullable(),
  gradedAt: z.string().datetime().nullable(),
  idempotencyKey: z.string().min(1),
});
export type AssessmentAttempt = z.infer<typeof AssessmentAttemptSchema>;
