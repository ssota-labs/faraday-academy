import { getPlatform, json, error, learnerIdFromRequest } from "@/lib/platform";

export async function GET(req: Request) {
  const userId = learnerIdFromRequest(req);
  if (!userId) return error("UNAUTHORIZED", "missing user", 401);
  const platform = getPlatform();
  const courses = await platform.store.listCourses();
  const mine = [];
  for (const c of courses) {
    const enrollment = await platform.store.getEnrollment(c.id, userId);
    const progress = await platform.lms.getProgress(c.id, userId);
    if (enrollment || progress) {
      mine.push({ courseId: c.id, enrollment, progress });
    }
  }
  return json({
    userId,
    learning: mine,
    exportedAt: new Date().toISOString(),
  });
}

export async function DELETE(req: Request) {
  const userId = learnerIdFromRequest(req);
  if (!userId) return error("UNAUTHORIZED", "missing user", 401);
  // Soft-delete stub — full wipe lands with Supabase adapter.
  return json({
    deleted: true,
    userId,
    note: "deletion queued (memory adapter clears on process restart)",
  });
}
