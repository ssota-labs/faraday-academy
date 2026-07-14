import { getPlatform, json, error, learnerIdFromRequest } from "@/lib/platform";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ courseId: string }> },
) {
  const userId = learnerIdFromRequest(req);
  if (!userId) return error("UNAUTHORIZED", "missing user", 401);
  const { courseId } = await ctx.params;
  const platform = getPlatform();
  const hasAccess = await platform.lms.hasAccess(courseId, userId);
  try {
    const threads = await platform.community.listThreads(courseId, hasAccess);
    return json({ threads });
  } catch {
    return error("FORBIDDEN", "no access", 403);
  }
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ courseId: string }> },
) {
  const userId = learnerIdFromRequest(req);
  if (!userId) return error("UNAUTHORIZED", "missing user", 401);
  const { courseId } = await ctx.params;
  const body = await req.json();
  const platform = getPlatform();
  const hasAccess = await platform.lms.hasAccess(courseId, userId);
  try {
    const thread = await platform.community.createThread({
      courseId,
      authorId: userId,
      title: body.title,
      body: body.body,
      hasAccess,
    });
    return json({ thread }, 201);
  } catch {
    return error("FORBIDDEN", "no access", 403);
  }
}
