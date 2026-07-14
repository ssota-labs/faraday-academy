import { getPlatform, json, error, learnerIdFromRequest } from "@/lib/platform";

export async function POST(req: Request) {
  const userId = learnerIdFromRequest(req);
  if (!userId) return error("UNAUTHORIZED", "missing user", 401);
  const body = await req.json();
  const platform = getPlatform();
  const course = await platform.releases.createCourse({
    ownerId: userId,
    slug: body.slug,
    title: body.title ?? "Untitled",
    access: body.access,
  });
  const { draftId } = await platform.studio.saveDraft({
    courseId: course.id,
    ownerId: userId,
    files: {
      "index.html": "<!doctype html><html><body><h1>New course</h1></body></html>",
    },
  });
  return json({ courseId: course.id, draftId, slug: course.slug });
}
