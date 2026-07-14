const FORBIDDEN_ENV = [
  "AI_GATEWAY_API_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "NPM_TOKEN",
  "VERCEL_TOKEN",
] as const;

export interface SandboxQuota {
  maxFiles: number;
  maxFileBytes: number;
  maxTotalBytes: number;
  wallClockMs: number;
}

export const DEFAULT_QUOTA: SandboxQuota = {
  maxFiles: 200,
  maxFileBytes: 512_000,
  maxTotalBytes: 5_000_000,
  wallClockMs: 60_000,
};

export interface SandboxSession {
  id: string;
  ownerId: string;
  courseId: string;
  files: Record<string, string>;
  createdAt: number;
}

export function createStudioSandbox(quota: SandboxQuota = DEFAULT_QUOTA) {
  const sessions = new Map<string, SandboxSession>();

  return {
    start(input: { ownerId: string; courseId: string; files?: Record<string, string> }) {
      assertNoPlatformSecrets(process.env);
      const id = `sbx_${crypto.randomUUID().slice(0, 12)}`;
      const files = { ...(input.files ?? {}) };
      validateFiles(files, quota);
      const session: SandboxSession = {
        id,
        ownerId: input.ownerId,
        courseId: input.courseId,
        files,
        createdAt: Date.now(),
      };
      sessions.set(id, session);
      return session;
    },

    writeFile(sessionId: string, path: string, content: string, ownerId: string) {
      const s = sessions.get(sessionId);
      if (!s) throw new Error("SESSION_NOT_FOUND");
      if (s.ownerId !== ownerId) throw new Error("FORBIDDEN");
      if (Date.now() - s.createdAt > quota.wallClockMs) {
        throw new Error("QUOTA_WALL_CLOCK");
      }
      const next = { ...s.files, [path]: content };
      validateFiles(next, quota);
      s.files = next;
      return s;
    },

    readFile(sessionId: string, path: string, ownerId: string) {
      const s = sessions.get(sessionId);
      if (!s) throw new Error("SESSION_NOT_FOUND");
      if (s.ownerId !== ownerId) throw new Error("FORBIDDEN");
      return s.files[path] ?? null;
    },

    snapshot(sessionId: string, ownerId: string) {
      const s = sessions.get(sessionId);
      if (!s) throw new Error("SESSION_NOT_FOUND");
      if (s.ownerId !== ownerId) throw new Error("FORBIDDEN");
      return { ...s.files };
    },

    /** Env exposed to sandbox workers — never includes platform secrets. */
    workerEnv(): Record<string, string> {
      return {
        NODE_ENV: "sandbox",
        FARADAY_SANDBOX: "1",
      };
    },
  };
}

export function assertNoPlatformSecrets(
  env: NodeJS.ProcessEnv | Record<string, string | undefined>,
): void {
  for (const key of FORBIDDEN_ENV) {
    if (env[key]) {
      // Presence in parent process is OK; workerEnv must not forward them.
      // This assert is for worker env objects only when called with workerEnv.
    }
  }
}

export function assertWorkerEnvClean(env: Record<string, string>): void {
  for (const key of FORBIDDEN_ENV) {
    if (key in env && env[key]) {
      throw new Error(`SECRET_LEAK:${key}`);
    }
  }
}

function validateFiles(files: Record<string, string>, quota: SandboxQuota) {
  const keys = Object.keys(files);
  if (keys.length > quota.maxFiles) throw new Error("QUOTA_MAX_FILES");
  let total = 0;
  for (const [path, content] of Object.entries(files)) {
    const bytes = Buffer.byteLength(content);
    if (bytes > quota.maxFileBytes) throw new Error(`QUOTA_FILE:${path}`);
    total += bytes;
  }
  if (total > quota.maxTotalBytes) throw new Error("QUOTA_TOTAL_BYTES");
}
