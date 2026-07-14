import type { PlatformStore } from "./ports";

export interface CostSnapshot {
  tutorTokens: number;
  storageBytes: number;
  egressBytes: number;
  buildMinutes: number;
  updatedAt: string;
}

export function createOpsService(store: PlatformStore) {
  return {
    async costDashboard(userId: string, courseId: string): Promise<CostSnapshot> {
      const [tutorTokens, storageBytes, egressBytes, buildMinutes] =
        await Promise.all([
          store.sumUsage(userId, courseId, "TUTOR_TOKENS"),
          store.sumUsage(userId, courseId, "STORAGE_BYTES"),
          store.sumUsage(userId, courseId, "EGRESS_BYTES"),
          store.sumUsage(userId, courseId, "BUILD_MINUTES"),
        ]);
      return {
        tutorTokens,
        storageBytes,
        egressBytes,
        buildMinutes,
        updatedAt: new Date().toISOString(),
      };
    },

    async verifyReleaseIntegrity(input: {
      buildHash: string;
      expectedFiles: Array<{ path: string; sha256: string }>;
    }): Promise<{ ok: boolean; missing: string[]; mismatched: string[] }> {
      const missing: string[] = [];
      const mismatched: string[] = [];
      const { createHash } = await import("node:crypto");
      for (const f of input.expectedFiles) {
        const content = await store.getArtifactFile(input.buildHash, f.path);
        if (content == null) {
          missing.push(f.path);
          continue;
        }
        const hex = createHash("sha256")
          .update(typeof content === "string" ? content : Buffer.from(content))
          .digest("hex");
        if (hex !== f.sha256) mismatched.push(f.path);
      }
      return { ok: missing.length === 0 && mismatched.length === 0, missing, mismatched };
    },
  };
}

export function createPlatformServices(store: PlatformStore) {
  // lazy imports avoided — callers import factories directly
  return { store };
}
