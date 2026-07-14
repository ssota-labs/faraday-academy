import { getPlatform, error, learnerIdFromRequest } from "@/lib/platform";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ runId: string }> },
) {
  const userId = learnerIdFromRequest(req);
  if (!userId) return error("UNAUTHORIZED", "missing user", 401);
  const { runId } = await ctx.params;
  const platform = getPlatform();
  try {
    const run = await platform.tutor.getRun(runId, userId);
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            `event: meta\ndata: ${JSON.stringify({ runId: run.id, status: run.status })}\n\n`,
          ),
        );
        controller.enqueue(
          encoder.encode(
            `event: token\ndata: ${JSON.stringify({ text: "Tutor stub: grounded reply." })}\n\n`,
          ),
        );
        controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
        controller.close();
      },
    });
    return new Response(stream, {
      headers: {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
      },
    });
  } catch (e) {
    return error("FORBIDDEN", e instanceof Error ? e.message : "failed", 403);
  }
}
