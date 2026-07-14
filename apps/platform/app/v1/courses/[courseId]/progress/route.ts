import { getPlatform, json, error, learnerIdFromRequest } from "@/lib/platform";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ courseId: string }> },
) {
  const userId = learnerIdFromRequest(req);
  if (!userId) return error("UNAUTHORIZED", "missing user", 401);
  const { courseId } = await ctx.params;
  const platform = getPlatform();
  const progress = await platform.lms.getProgress(courseId, userId);
  return json({ progress });
}
