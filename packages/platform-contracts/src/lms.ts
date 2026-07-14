import { z } from "zod";

export const LearningEventSchema = z.object({
  eventId: z.string().min(1),
  schemaVersion: z.literal(1),
  courseId: z.string().min(1),
  courseVersionId: z.string().min(1),
  learnerId: z.string().min(1),
  sessionId: z.string().min(1),
  nodeId: z.string().min(1).optional(),
  type: z.string().min(1),
  occurredAt: z.string().datetime(),
  payload: z.unknown().optional(),
});
export type LearningEvent = z.infer<typeof LearningEventSchema>;

/** Client may omit learnerId — server fills from session. */
export const LearningEventIntentSchema = LearningEventSchema.omit({
  learnerId: true,
}).extend({
  learnerId: z.string().min(1).optional(),
});
export type LearningEventIntent = z.infer<typeof LearningEventIntentSchema>;

export const ProgressProjectionSchema = z.object({
  courseId: z.string().min(1),
  courseVersionId: z.string().min(1),
  learnerId: z.string().min(1),
  completedNodeIds: z.array(z.string()),
  xp: z.number().int().nonnegative(),
  lastEventAt: z.string().datetime().nullable(),
  updatedAt: z.string().datetime(),
});
export type ProgressProjection = z.infer<typeof ProgressProjectionSchema>;

export const EnrollmentSchema = z.object({
  id: z.string().min(1),
  courseId: z.string().min(1),
  learnerId: z.string().min(1),
  courseVersionId: z.string().min(1),
  createdAt: z.string().datetime(),
});
export type Enrollment = z.infer<typeof EnrollmentSchema>;
