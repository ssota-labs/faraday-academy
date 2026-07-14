import { getPlatform, json, error, learnerIdFromRequest } from "@/lib/platform";

export async function POST(req: Request) {
  const userId = learnerIdFromRequest(req);
  if (!userId) return error("UNAUTHORIZED", "missing user", 401);
  const body = await req.json();
  const platform = getPlatform();
  try {
    const course = await platform.releases.rollback({
      courseId: body.courseId,
      releaseId: body.releaseId,
      actorId: userId,
    });
    return json({ activeReleaseId: course.activeReleaseId });
  } catch (e) {
    return error("ROLLBACK_FAILED", e instanceof Error ? e.message : "failed", 400);
  }
}
