import { getPlatform, json, error, learnerIdFromRequest } from "@/lib/platform";
import { StudioChatRequestSchema } from "@faraday-academy/platform-contracts";

export async function POST(req: Request) {
  const userId = learnerIdFromRequest(req);
  if (!userId) return error("UNAUTHORIZED", "missing user", 401);
  const body = StudioChatRequestSchema.parse(await req.json());
  const platform = getPlatform();
  const draftId = body.draftId;
  if (!draftId) return error("DRAFT_REQUIRED", "draftId required");

  const last = body.messages.at(-1) as { content?: string } | undefined;
  const message = typeof last?.content === "string" ? last.content : "";
  const turn = await platform.studio.agentTurn({
    ownerId: userId,
    courseId: body.courseId,
    draftId,
    message,
  });

  // Seed a simple preview page when agent "builds"
  if (turn.previewBuildId) {
    const draft = await platform.studio.getDraft(draftId, userId);
    await platform.store.saveArtifactFile(
      turn.previewBuildId,
      "index.html",
      draft.files["index.html"] ?? "<html><body>preview</body></html>",
    );
  }

  return json({
    reply: turn.reply,
    previewUrl: turn.previewBuildId
      ? `/api/preview/${turn.previewBuildId}/`
      : null,
  });
}
