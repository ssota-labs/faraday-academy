import { getPlatform, json } from "@/lib/platform";

/** Learning host Course Shell — hostname → course → shell HTML. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const host =
    req.headers.get("x-forwarded-host") ??
    req.headers.get("host") ??
    url.searchParams.get("host") ??
    "";
  const platform = getPlatform();
  const resolved = await platform.router.resolve(host.split(":")[0]!);
  if (!resolved) {
    return new Response("Course not found", { status: 404 });
  }
  return new Response(resolved.shellHtml, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "private, max-age=30",
      "content-security-policy":
        "default-src 'self'; frame-src https: http:; script-src 'unsafe-inline' 'self'; style-src 'unsafe-inline' 'self'",
    },
  });
}

export async function POST() {
  return json({ ok: true, surface: "learn" });
}
