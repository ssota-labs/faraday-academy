import { getPlatform, json, error } from "@/lib/platform";

export async function POST(req: Request) {
  const body = await req.json();
  const platform = getPlatform();
  try {
    const result = await platform.auth.exchange(body);
    return json(result);
  } catch (e) {
    const err = e as { code?: string; message?: string };
    const status = err.code === "CODE_REPLAY" ? 409 : 400;
    return error(err.code ?? "AUTH_ERROR", err.message ?? "exchange failed", status);
  }
}
