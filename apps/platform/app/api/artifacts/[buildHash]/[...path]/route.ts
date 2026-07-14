import { getPlatform } from "@/lib/platform";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ buildHash: string; path: string[] }> },
) {
  const { buildHash, path } = await ctx.params;
  const filePath = path.join("/") || "index.html";
  const platform = getPlatform();
  const file = await platform.router.getArtifact(buildHash, filePath);
  if (!file) return new Response("Not found", { status: 404 });
  const body =
    typeof file.content === "string"
      ? file.content
      : Buffer.from(file.content);
  return new Response(body, {
    headers: {
      "content-type": file.contentType,
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
