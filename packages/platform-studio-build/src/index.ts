import {
  createReleaseService,
  scanPublicArtifactForSecrets,
  sha256Hex,
  type PlatformStore,
} from "@faraday-academy/platform-core";
import type { CourseDefinition } from "@faraday-academy/platform-contracts";

export interface BuildInput {
  courseId: string;
  createdBy: string;
  definition: CourseDefinition;
  files: Record<string, string>;
  sealed: unknown;
}

export function createStudioBuild(store: PlatformStore) {
  const releases = createReleaseService(store);

  return {
    validate(files: Record<string, string>, sealed: unknown) {
      if (!files["index.html"]) {
        return { ok: false as const, errors: ["missing index.html"] };
      }
      const scan = scanPublicArtifactForSecrets(files, sealed);
      if (!scan.ok) {
        return { ok: false as const, errors: scan.findings };
      }
      return { ok: true as const, errors: [] as string[] };
    },

    async buildAndPublish(input: BuildInput) {
      const validation = this.validate(input.files, input.sealed);
      if (!validation.ok) {
        return { ok: false as const, errors: validation.errors };
      }
      try {
        const result = await releases.publishBuild(input);
        return { ok: true as const, ...result };
      } catch (err) {
        return {
          ok: false as const,
          errors: [err instanceof Error ? err.message : String(err)],
        };
      }
    },

    contentHash(files: Record<string, string>): string {
      return sha256Hex(
        Object.entries(files)
          .map(([p, c]) => `${p}:${sha256Hex(c)}`)
          .sort()
          .join("|"),
      ).slice(0, 40);
    },
  };
}
