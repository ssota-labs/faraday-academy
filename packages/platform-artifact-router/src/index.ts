import type { CourseRecord, ReleaseManifest, ReleaseRecord } from "@faraday-academy/platform-contracts";
import {
  createReleaseService,
  extractCourseSlug,
  signGuestGrant,
  type PlatformStore,
} from "@faraday-academy/platform-core";

export interface ResolvedCourse {
  course: CourseRecord;
  release: ReleaseRecord;
  manifest: ReleaseManifest;
  artifactOrigin: string;
  shellHtml: string;
  guestGrant?: string;
}

export function createArtifactRouter(
  store: PlatformStore,
  opts: {
    artifactHostSuffix?: string;
    guestSecret?: string;
  } = {},
) {
  const releases = createReleaseService(store);
  const artifactHostSuffix = opts.artifactHostSuffix ?? "artifact.faraday.com";
  const guestSecret = opts.guestSecret ?? "dev-guest-secret";

  return {
    extractCourseSlug,

    async resolve(hostname: string): Promise<ResolvedCourse | null> {
      const resolved = await releases.resolveLearningHost(hostname);
      if (!resolved) return null;
      const { course, release, manifest } = resolved;
      const artifactOrigin = `https://${release.buildHash}.${artifactHostSuffix}`;

      let guestGrant: string | undefined;
      if (course.access === "PUBLIC_FREE") {
        const now = Math.floor(Date.now() / 1000);
        guestGrant = signGuestGrant(guestSecret, {
          courseId: course.id,
          releaseId: release.id,
          iat: now,
          exp: now + 3600,
        });
      }

      const shellHtml = renderCourseShell({
        course,
        release,
        artifactOrigin,
        guestGrant,
      });

      return {
        course,
        release,
        manifest,
        artifactOrigin,
        shellHtml,
        guestGrant,
      };
    },

    async getArtifact(
      buildHash: string,
      path: string,
    ): Promise<{ content: string | Uint8Array; contentType: string } | null> {
      const content = await store.getArtifactFile(buildHash, path);
      if (content == null) return null;
      return { content, contentType: contentTypeFor(path) };
    },
  };
}

export function renderCourseShell(input: {
  course: CourseRecord;
  release: ReleaseRecord;
  artifactOrigin: string;
  guestGrant?: string;
}): string {
  const iframeSrc = `${input.artifactOrigin}/index.html`;
  // Trusted shell — learner tokens stay here, never injected into iframe.
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${escapeHtml(input.course.title)} · Faraday</title>
  <style>
    :root { color-scheme: light; --ink:#1a1f2e; --paper:#f7f4ef; --accent:#0b6e4f; }
    * { box-sizing: border-box; }
    body { margin:0; font-family: "IBM Plex Sans", "Segoe UI", sans-serif; background:var(--paper); color:var(--ink); }
    header { display:flex; align-items:center; justify-content:space-between; padding:0.75rem 1.25rem; border-bottom:1px solid #ddd5c8; }
    header strong { font-size:1.1rem; letter-spacing:-0.02em; }
    main { display:grid; grid-template-rows: 1fr auto; height: calc(100vh - 52px); }
    iframe { width:100%; height:100%; border:0; background:#fff; }
    #overlays { position:fixed; inset:auto 1rem 1rem auto; display:flex; gap:0.5rem; }
    button { background:var(--accent); color:#fff; border:0; padding:0.55rem 0.9rem; border-radius:6px; cursor:pointer; font:inherit; }
  </style>
</head>
<body>
  <header>
    <strong>Faraday · ${escapeHtml(input.course.title)}</strong>
    <span data-release="${escapeHtml(input.release.id)}">release ${escapeHtml(input.release.buildHash.slice(0, 8))}</span>
  </header>
  <main>
    <iframe
      id="ugc"
      title="Course content"
      src="${escapeHtml(iframeSrc)}"
      sandbox="allow-scripts allow-same-origin"
      referrerpolicy="no-referrer"
    ></iframe>
  </main>
  <div id="overlays">
    <button type="button" data-surface="TUTOR">Tutor</button>
    <button type="button" data-surface="COMMUNITY">Community</button>
    <button type="button" data-surface="OFFICIAL_ASSESSMENT">Assessment</button>
  </div>
  <script>
    window.__FARADAY_SHELL__ = {
      courseId: ${JSON.stringify(input.course.id)},
      releaseId: ${JSON.stringify(input.release.id)},
      courseVersionId: ${JSON.stringify(input.release.courseVersionId)},
      artifactOrigin: ${JSON.stringify(input.artifactOrigin)},
      guestGrant: ${JSON.stringify(input.guestGrant ?? null)},
      // Intentionally NO session/access tokens for UGC.
    };
    const ugc = document.getElementById('ugc');
    window.addEventListener('message', (ev) => {
      if (ev.origin !== ${JSON.stringify(input.artifactOrigin)}) return;
      if (ev.source !== ugc.contentWindow) return;
      const data = ev.data;
      if (!data || typeof data !== 'object') return;
      if (data.method === 'emitInteraction' || data.method === 'requestTrustedSurface') {
        console.info('[shell] ugc bridge', data.method);
      }
    });
    document.getElementById('overlays').addEventListener('click', (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      const kind = t.getAttribute('data-surface');
      if (kind) console.info('[shell] open trusted surface', kind);
    });
  </script>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function contentTypeFor(path: string): string {
  if (path.endsWith(".html")) return "text/html; charset=utf-8";
  if (path.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (path.endsWith(".css")) return "text/css; charset=utf-8";
  if (path.endsWith(".json")) return "application/json";
  return "application/octet-stream";
}
