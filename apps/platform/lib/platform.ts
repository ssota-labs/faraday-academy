import { createPlatformAdapter } from "@faraday-academy/platform-adapter-supabase";
import {
  createAuthBootstrap,
  createReleaseService,
  createLmsService,
  createAssessmentService,
  createTutorService,
  createStudioService,
  createCommerceService,
  createCommunityService,
  createOpsService,
} from "@faraday-academy/platform-core";
import { createArtifactRouter } from "@faraday-academy/platform-artifact-router";
import { createStudioBuild } from "@faraday-academy/platform-studio-build";
import { createStudioSandbox } from "@faraday-academy/platform-studio-sandbox";

const globalForPlatform = globalThis as unknown as {
  __faradayPlatform?: ReturnType<typeof buildPlatform>;
};

function buildPlatform() {
  const { store, mode } = createPlatformAdapter();
  return {
    mode,
    store,
    auth: createAuthBootstrap(store),
    releases: createReleaseService(store),
    lms: createLmsService(store),
    assessment: createAssessmentService(store),
    tutor: createTutorService(store),
    studio: createStudioService(store),
    commerce: createCommerceService(store),
    community: createCommunityService(store),
    ops: createOpsService(store),
    router: createArtifactRouter(store),
    build: createStudioBuild(store),
    sandbox: createStudioSandbox(),
  };
}

export function getPlatform() {
  if (!globalForPlatform.__faradayPlatform) {
    globalForPlatform.__faradayPlatform = buildPlatform();
  }
  return globalForPlatform.__faradayPlatform;
}

export function learnerIdFromRequest(req: Request): string | null {
  return req.headers.get("x-faraday-user-id");
}

export function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export function error(code: string, message: string, status = 400) {
  return Response.json({ error: { code, message } }, { status });
}
