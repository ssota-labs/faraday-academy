import { getPlatform, json, error, learnerIdFromRequest } from "@/lib/platform";
import { PlatformTutorRequestSchema } from "@faraday-academy/platform-contracts";

export async function POST(req: Request) {
  const userId = learnerIdFromRequest(req);
  if (!userId) return error("UNAUTHORIZED", "missing user", 401);
  const body = PlatformTutorRequestSchema.parse(await req.json());
  const platform = getPlatform();

  // Resolve course from version
  const version = await platform.store.getCourseVersion(body.courseVersionId);
  if (!version) return error("NOT_FOUND", "course version not found", 404);
  const ok = await platform.lms.hasAccess(version.courseId, userId);
  if (!ok) {
    // allow free grant attempt
    const course = await platform.store.getCourse(version.courseId);
    if (course?.access === "PUBLIC_FREE") {
      await platform.lms.ensureFreeEntitlement({
        courseId: version.courseId,
        userId,
      });
    } else {
      return error("FORBIDDEN", "no entitlement", 403);
    }
  }

  try {
    const result = await platform.tutor.startRun({
      userId,
      courseId: version.courseId,
      courseVersionId: body.courseVersionId,
      conversationId: body.conversationId,
      officialAttemptId: body.officialAttemptId,
      messages: body.messages,
      clientContext: (body as { context?: unknown }).context,
    });
    return json({
      runId: result.run.id,
      conversationId: result.run.conversationId,
      status: result.run.status,
      locked: result.locked,
      streamUrl: `/v1/tutor/runs/${result.run.id}/stream`,
    });
  } catch (e) {
    const err = e as { message?: string; run?: { id: string } };
    if (err.message === "BUDGET_EXCEEDED") {
      return error("BUDGET_EXCEEDED", "tutor budget exceeded", 429);
    }
    return error("TUTOR_FAILED", err.message ?? "failed", 400);
  }
}
