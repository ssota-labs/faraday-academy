import { z } from "zod";

export const ReleaseStatusSchema = z.enum([
  "PENDING",
  "READY",
  "SUPERSEDED",
  "FAILED",
]);
export type ReleaseStatus = z.infer<typeof ReleaseStatusSchema>;

export const ReleaseFileSchema = z.object({
  path: z.string().min(1),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  bytes: z.number().int().nonnegative(),
});
export type ReleaseFile = z.infer<typeof ReleaseFileSchema>;

export const ReleaseManifestSchema = z.object({
  schemaVersion: z.literal(1),
  buildHash: z.string().min(1),
  courseId: z.string().min(1),
  courseVersionId: z.string().min(1),
  runtimeVersion: z.string().min(1),
  createdAt: z.string().datetime(),
  entrypoint: z.literal("index.html"),
  files: z.array(ReleaseFileSchema),
});
export type ReleaseManifest = z.infer<typeof ReleaseManifestSchema>;

export const ReleaseRecordSchema = z.object({
  id: z.string().min(1),
  courseId: z.string().min(1),
  courseVersionId: z.string().min(1),
  buildHash: z.string().min(1),
  status: ReleaseStatusSchema,
  manifestSha256: z.string().regex(/^[a-f0-9]{64}$/),
  publicArtifactPath: z.string().min(1),
  sealedBundlePath: z.string().min(1),
  createdAt: z.string().datetime(),
  createdBy: z.string().min(1),
});
export type ReleaseRecord = z.infer<typeof ReleaseRecordSchema>;

export const CourseVersionSchema = z.object({
  id: z.string().min(1),
  courseId: z.string().min(1),
  definition: z.record(z.unknown()),
  createdAt: z.string().datetime(),
  publishedAt: z.string().datetime().nullable(),
});
export type CourseVersion = z.infer<typeof CourseVersionSchema>;
