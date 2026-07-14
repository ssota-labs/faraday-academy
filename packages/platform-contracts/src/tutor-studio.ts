import { z } from "zod";

export const PlatformTutorRequestSchema = z.object({
  messages: z.array(z.unknown()),
  courseVersionId: z.string().min(1),
  nodeId: z.string().min(1).optional(),
  conversationId: z.string().min(1).optional(),
  officialAttemptId: z.string().min(1).optional(),
});
export type PlatformTutorRequest = z.infer<typeof PlatformTutorRequestSchema>;

export const TutorRunSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  courseId: z.string().min(1),
  courseVersionId: z.string().min(1),
  conversationId: z.string().min(1),
  status: z.enum(["RUNNING", "COMPLETED", "FAILED", "BUDGET_EXCEEDED"]),
  officialAttemptId: z.string().nullable(),
  modelVersion: z.string().nullable(),
  groundingVersion: z.string().nullable(),
  createdAt: z.string().datetime(),
});
export type TutorRun = z.infer<typeof TutorRunSchema>;

export const StudioChatRequestSchema = z.object({
  messages: z.array(z.unknown()),
  courseId: z.string().min(1),
  draftId: z.string().min(1).optional(),
});
export type StudioChatRequest = z.infer<typeof StudioChatRequestSchema>;
