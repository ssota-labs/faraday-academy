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
    const graded = await platform.assessment.submit({
      attemptId: id,
      learnerId: userId,
      responses: body.responses ?? {},
      clientScore: body.score,
      clientPassed: body.passed,
      clientCorrect: body.correct,
    });
    if (graded.passed) {
      await platform.lms.grantAssessmentCompletion({
        learnerId: userId,
        courseId: graded.courseId,
        courseVersionId: graded.courseVersionId,
        nodeId: graded.assessmentId,
        sessionId: body.sessionId ?? "shell",
      });
    }
    return json({
      attemptId: graded.id,
      status: graded.status,
      score: graded.score,
      passed: graded.passed,
    });
  } catch (e) {
    return error("SUBMIT_FAILED", e instanceof Error ? e.message : "failed", 400);
  }
}
