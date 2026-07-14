import { z } from "zod";

export const CourseStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export type CourseStatus = z.infer<typeof CourseStatusSchema>;

export const CourseAccessSchema = z.enum(["PUBLIC_FREE", "PUBLIC_PAID"]);
export type CourseAccess = z.infer<typeof CourseAccessSchema>;

export const CourseNodeSchema = z.object({
  id: z.string().min(1),
  lessonComponentId: z.string().min(1),
  requires: z.array(z.string().min(1)).optional(),
  completionRule: z.unknown().optional(),
});
export type CourseNode = z.infer<typeof CourseNodeSchema>;

export const CourseDefinitionSchema = z.object({
  schemaVersion: z.literal(1),
  courseId: z.string().min(1),
  title: z.string().min(1).optional(),
  nodes: z.array(CourseNodeSchema),
  outcomes: z.array(z.unknown()).default([]),
  assessments: z.array(z.unknown()).default([]),
  completionRules: z.array(z.unknown()).default([]),
  gradingPolicy: z.record(z.unknown()).default({}),
  customMetadata: z.record(z.unknown()).default({}),
});
export type CourseDefinition = z.infer<typeof CourseDefinitionSchema>;

export const CourseRecordSchema = z.object({
  id: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  ownerId: z.string().min(1),
  title: z.string().min(1),
  status: CourseStatusSchema,
  access: CourseAccessSchema,
  activeReleaseId: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type CourseRecord = z.infer<typeof CourseRecordSchema>;
