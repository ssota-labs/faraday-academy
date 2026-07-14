import { getPlatform, json, error, learnerIdFromRequest } from "@/lib/platform";

export async function POST(req: Request) {
  const userId = learnerIdFromRequest(req);
  if (!userId) return error("UNAUTHORIZED", "missing user", 401);
  const body = await req.json();
  const platform = getPlatform();
  const result = await platform.lms.ingestEvents({
    learnerId: userId,
    intents: body.events ?? [],
  });
  return json(result);
}
