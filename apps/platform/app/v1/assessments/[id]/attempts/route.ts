import { getPlatform, json, error, learnerIdFromRequest } from "@/lib/platform";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const userId = learnerIdFromRequest(req);
  if (!userId) return error("UNAUTHORIZED", "missing user", 401);
  const { id } = await ctx.params;
  const body = await req.json();
  const platform = getPlatform();
  try {
    const attempt = await platform.assessment.startAttempt({
      assessmentId: id,
      learnerId: userId,
      courseId: body.courseId,
      courseVersionId: body.courseVersionId,
      idempotencyKey: body.idempotencyKey ?? `atm_${Date.now()}`,
    });
    // Never return sealed answers
    return json({
      attempt: {
        id: attempt.id,
        status: attempt.status,
        itemOrder: attempt.itemOrder,
        assessmentVersionId: attempt.assessmentVersionId,
      },
    });
  } catch (e) {
    return error("ATTEMPT_FAILED", e instanceof Error ? e.message : "failed", 400);
  }
}
