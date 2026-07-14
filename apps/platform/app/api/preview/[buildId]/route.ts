import { getPlatform } from "@/lib/platform";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ buildId: string }> },
) {
  const { buildId } = await ctx.params;
  const platform = getPlatform();
  const file = await platform.router.getArtifact(buildId, "index.html");
  if (!file) {
    return new Response("Not found", { status: 404 });
  }
  const content =
    typeof file.content === "string"
      ? file.content
      : Buffer.from(file.content).toString("utf8");
  return new Response(content, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'",
    },
  });
}
