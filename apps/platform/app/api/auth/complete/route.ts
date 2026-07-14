import { getPlatform, json, error } from "@/lib/platform";

export async function POST(req: Request) {
  const body = await req.json();
  const platform = getPlatform();
  try {
    const result = await platform.auth.completeLogin({
      state: body.state,
      userId: body.userId ?? "demo_user",
    });
    return json(result);
  } catch (e) {
    const err = e as { code?: string; message?: string };
    return error(err.code ?? "AUTH_ERROR", err.message ?? "login failed", 400);
  }
}
