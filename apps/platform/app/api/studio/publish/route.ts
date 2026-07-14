import { getPlatform, json, error, learnerIdFromRequest } from "@/lib/platform";
import { CourseDefinitionSchema } from "@faraday-academy/platform-contracts";

export async function POST(req: Request) {
  const userId = learnerIdFromRequest(req);
  if (!userId) return error("UNAUTHORIZED", "missing user", 401);
  const body = await req.json();
  const platform = getPlatform();
  const definition = CourseDefinitionSchema.parse(body.definition);
  const result = await platform.build.buildAndPublish({
    courseId: body.courseId,
    createdBy: userId,
    definition,
    files: body.files ?? {},
    sealed: body.sealed ?? {},
  });
  if (!result.ok) return error("BUILD_FAILED", result.errors.join("; "), 422);
  return json({
    releaseId: result.release.id,
    buildHash: result.release.buildHash,
    courseVersionId: result.release.courseVersionId,
  });
}
