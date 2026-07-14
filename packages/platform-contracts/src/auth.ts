import { z } from "zod";

export const AuthBootstrapStateSchema = z.object({
  state: z.string().min(16),
  codeChallenge: z.string().min(16),
  codeChallengeMethod: z.literal("S256"),
  returnTo: z.string().url(),
  nonce: z.string().min(16),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
});
export type AuthBootstrapState = z.infer<typeof AuthBootstrapStateSchema>;

export const AuthOneTimeCodeSchema = z.object({
  code: z.string().min(32),
  userId: z.string().min(1),
  returnTo: z.string().url(),
  codeChallenge: z.string().min(16),
  used: z.boolean(),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
});
export type AuthOneTimeCode = z.infer<typeof AuthOneTimeCodeSchema>;

export const AuthCodeExchangeRequestSchema = z.object({
  code: z.string().min(32),
  codeVerifier: z.string().min(16),
  state: z.string().min(16),
});
export type AuthCodeExchangeRequest = z.infer<
  typeof AuthCodeExchangeRequestSchema
>;

export const ALLOWED_RETURN_TO_HOST_SUFFIXES = [
  ".learn.faraday.com",
  ".learn.localhost",
  "localhost",
] as const;

export function isAllowedReturnTo(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.hostname !== "localhost") {
      if (!(u.protocol === "http:" && u.hostname === "localhost")) return false;
    }
    if (u.hostname === "localhost") return true;
    return ALLOWED_RETURN_TO_HOST_SUFFIXES.some(
      (suffix) =>
        suffix.startsWith(".") &&
        (u.hostname.endsWith(suffix) || u.hostname === suffix.slice(1)),
    );
  } catch {
    return false;
  }
}
