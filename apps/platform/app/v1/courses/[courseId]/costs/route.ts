import { getPlatform, json, error, learnerIdFromRequest } from "@/lib/platform";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ courseId: string }> },
) {
  const userId = learnerIdFromRequest(req);
  if (!userId) return error("UNAUTHORIZED", "missing user", 401);
  const { courseId } = await ctx.params;
  const platform = getPlatform();
  const course = await platform.store.getCourse(courseId);
  if (!course || course.ownerId !== userId) {
    return error("FORBIDDEN", "owner only", 403);
  }
  const snap = await platform.ops.costDashboard(userId, courseId);
  return json({ costs: snap });
}
