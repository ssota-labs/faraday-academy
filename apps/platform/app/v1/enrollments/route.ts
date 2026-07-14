import { getPlatform, json, error, learnerIdFromRequest } from "@/lib/platform";

export async function POST(req: Request) {
  const userId = learnerIdFromRequest(req);
  if (!userId) return error("UNAUTHORIZED", "missing user", 401);
  const body = await req.json();
  const platform = getPlatform();
  const course = await platform.store.getCourse(body.courseId);
  if (!course) return error("NOT_FOUND", "course not found", 404);

  if (course.access === "PUBLIC_FREE") {
    await platform.lms.ensureFreeEntitlement({
      courseId: course.id,
      userId,
    });
  } else {
    const ok = await platform.lms.hasAccess(course.id, userId);
    if (!ok) return error("PAYMENT_REQUIRED", "purchase required", 402);
  }

  const release = course.activeReleaseId
    ? await platform.store.getRelease(course.activeReleaseId)
    : null;
  if (!release) return error("NO_RELEASE", "course has no active release", 409);

  const enrollment = await platform.lms.enroll({
    courseId: course.id,
    learnerId: userId,
    courseVersionId: release.courseVersionId,
  });
  return json({ enrollment });
}
