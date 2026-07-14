import { getPlatform, json, error, learnerIdFromRequest } from "@/lib/platform";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ courseId: string }> },
) {
  const userId = learnerIdFromRequest(req);
  if (!userId) return error("UNAUTHORIZED", "missing user", 401);
  const { courseId } = await ctx.params;
  const platform = getPlatform();
  const ents = await platform.store.listEntitlements(courseId, userId);
  const active = ents.find((e) => e.status === "ACTIVE") ?? null;
  return json({ entitlement: active, hasAccess: Boolean(active) });
}
