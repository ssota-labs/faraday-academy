import { createHash } from "node:crypto";
import {
  CourseDefinitionSchema,
  ReleaseManifestSchema,
  type CourseDefinition,
  type CourseRecord,
  type ReleaseManifest,
  type ReleaseRecord,
} from "@faraday-academy/platform-contracts";
import type { PlatformStore } from "./ports";
import { createId, nowIso } from "./ports";

export function sha256Hex(data: string | Uint8Array): string {
  return createHash("sha256").update(data).digest("hex");
}

export function createReleaseService(store: PlatformStore) {
  return {
    async createCourse(input: {
      ownerId: string;
      slug: string;
      title: string;
      access?: CourseRecord["access"];
    }): Promise<CourseRecord> {
      const existing = await store.getCourseBySlug(input.slug);
      if (existing) throw new Error("SLUG_TAKEN");
      const now = nowIso();
      const course: CourseRecord = {
        id: createId("course"),
        slug: input.slug,
        ownerId: input.ownerId,
        title: input.title,
        status: "DRAFT",
        access: input.access ?? "PUBLIC_FREE",
        activeReleaseId: null,
        createdAt: now,
        updatedAt: now,
      };
      await store.saveCourse(course);
      return course;
    },

    async publishBuild(input: {
      courseId: string;
      createdBy: string;
      definition: CourseDefinition;
      files: Record<string, string>;
      sealed: unknown;
      runtimeVersion?: string;
    }): Promise<{ release: ReleaseRecord; manifest: ReleaseManifest }> {
      const course = await store.getCourse(input.courseId);
      if (!course) throw new Error("COURSE_NOT_FOUND");

      const definition = CourseDefinitionSchema.parse(input.definition);
      const courseVersionId = createId("cv");
      await store.saveCourseVersion({
        id: courseVersionId,
        courseId: course.id,
        definition: definition as unknown as Record<string, unknown>,
        createdAt: nowIso(),
        publishedAt: nowIso(),
      });
      await store.saveDefinition(courseVersionId, definition);

      const fileEntries = Object.entries(input.files).filter(
        ([path]) => path !== "faraday.release.json",
      );
      for (const [path, content] of fileEntries) {
        await store.saveArtifactFile(courseVersionId, path, content);
      }

      const buildHash = sha256Hex(
        fileEntries
          .map(([p, c]) => `${p}:${sha256Hex(c)}`)
          .sort()
          .join("|"),
      ).slice(0, 40);

      // Re-store under buildHash for artifact serving
      for (const [path, content] of fileEntries) {
        await store.saveArtifactFile(buildHash, path, content);
      }

      const manifest: ReleaseManifest = {
        schemaVersion: 1,
        buildHash,
        courseId: course.id,
        courseVersionId,
        runtimeVersion: input.runtimeVersion ?? "0.1.0",
        createdAt: nowIso(),
        entrypoint: "index.html",
        files: fileEntries.map(([path, content]) => ({
          path,
          sha256: sha256Hex(content),
          bytes: Buffer.byteLength(content),
        })),
      };
      ReleaseManifestSchema.parse(manifest);
      await store.saveManifest(buildHash, manifest);
      await store.saveSealedBundle(courseVersionId, input.sealed);

      const scan = scanPublicArtifactForSecrets(input.files, input.sealed);
      if (!scan.ok) {
        throw new Error(`PUBLIC_ARTIFACT_LEAK:${scan.findings.join(",")}`);
      }

      const manifestSha256 = sha256Hex(JSON.stringify(manifest));
      const release: ReleaseRecord = {
        id: createId("rel"),
        courseId: course.id,
        courseVersionId,
        buildHash,
        status: "READY",
        manifestSha256,
        publicArtifactPath: `artifacts/${course.id}/${buildHash}/`,
        sealedBundlePath: `sealed/${courseVersionId}/`,
        createdAt: nowIso(),
        createdBy: input.createdBy,
      };
      await store.saveRelease(release);

      const updated: CourseRecord = {
        ...course,
        status: "PUBLISHED",
        activeReleaseId: release.id,
        updatedAt: nowIso(),
      };
      await store.saveCourse(updated);
      return { release, manifest };
    },

    async rollback(input: {
      courseId: string;
      releaseId: string;
      actorId: string;
    }): Promise<CourseRecord> {
      const course = await store.getCourse(input.courseId);
      if (!course) throw new Error("COURSE_NOT_FOUND");
      if (course.ownerId !== input.actorId) throw new Error("FORBIDDEN");
      const release = await store.getRelease(input.releaseId);
      if (!release || release.courseId !== course.id) {
        throw new Error("RELEASE_NOT_FOUND");
      }
      if (release.status !== "READY") throw new Error("RELEASE_NOT_READY");
      const updated: CourseRecord = {
        ...course,
        activeReleaseId: release.id,
        updatedAt: nowIso(),
      };
      await store.saveCourse(updated);
      return updated;
    },

    async resolveLearningHost(hostname: string): Promise<{
      course: CourseRecord;
      release: ReleaseRecord;
      manifest: ReleaseManifest;
    } | null> {
      const slug = extractCourseSlug(hostname);
      if (!slug) return null;
      const course = await store.getCourseBySlug(slug);
      if (!course?.activeReleaseId) return null;
      const release = await store.getRelease(course.activeReleaseId);
      if (!release || release.status !== "READY") return null;
      const manifest = await store.getManifest(release.buildHash);
      if (!manifest) return null;
      return { course, release, manifest };
    },
  };
}

export function extractCourseSlug(hostname: string): string | null {
  // physics.learn.faraday.com or physics.learn.localhost
  const m = hostname.match(/^([a-z0-9-]+)\.learn\./);
  return m?.[1] ?? null;
}

export function scanPublicArtifactForSecrets(
  files: Record<string, string>,
  sealed: unknown,
): { ok: boolean; findings: string[] } {
  const findings: string[] = [];
  const sealedJson = JSON.stringify(sealed ?? {});
  const answerSnippets: string[] = [];
  try {
    const s = sealed as { answers?: Record<string, unknown> };
    if (s?.answers) {
      for (const v of Object.values(s.answers)) {
        if (typeof v === "string" && v.length >= 1) answerSnippets.push(v);
      }
    }
  } catch {
    /* ignore */
  }

  for (const [path, content] of Object.entries(files)) {
    if (/AI_GATEWAY|SERVICE_ROLE|sk_live|BEGIN PRIVATE KEY/i.test(content)) {
      findings.push(`secret:${path}`);
    }
    for (const ans of answerSnippets) {
      if (ans.length >= 2 && content.includes(`"correct":"${ans}"`)) {
        findings.push(`answer_leak:${path}`);
      }
      if (
        ans.length >= 4 &&
        content.includes(ans) &&
        /official|answerKey|grading/i.test(content)
      ) {
        findings.push(`answer_context_leak:${path}`);
      }
    }
    if (content.includes(sealedJson) && sealedJson.length > 20) {
      findings.push(`sealed_blob:${path}`);
    }
  }
  return { ok: findings.length === 0, findings };
}
