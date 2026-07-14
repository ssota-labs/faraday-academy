import { z } from "zod";

export const CommunityThreadSchema = z.object({
  id: z.string().min(1),
  courseId: z.string().min(1),
  authorId: z.string().min(1),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(10_000),
  pinned: z.boolean().default(false),
  locked: z.boolean().default(false),
  hidden: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type CommunityThread = z.infer<typeof CommunityThreadSchema>;

export const CommunityCommentSchema = z.object({
  id: z.string().min(1),
  threadId: z.string().min(1),
  authorId: z.string().min(1),
  body: z.string().min(1).max(5_000),
  hidden: z.boolean().default(false),
  createdAt: z.string().datetime(),
});
export type CommunityComment = z.infer<typeof CommunityCommentSchema>;

export const CommunityReportSchema = z.object({
  id: z.string().min(1),
  courseId: z.string().min(1),
  reporterId: z.string().min(1),
  targetType: z.enum(["THREAD", "COMMENT"]),
  targetId: z.string().min(1),
  reason: z.string().min(1).max(1_000),
  createdAt: z.string().datetime(),
});
export type CommunityReport = z.infer<typeof CommunityReportSchema>;
