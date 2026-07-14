import { createHash, randomBytes, createHmac, timingSafeEqual } from "node:crypto";
import {
  AuthCodeExchangeRequestSchema,
  isAllowedReturnTo,
  type AuthBootstrapState,
  type AuthOneTimeCode,
} from "@faraday-academy/platform-contracts";
import type { PlatformStore } from "./ports";
import { createId, nowIso } from "./ports";

function sha256Base64Url(input: string): string {
  return createHash("sha256")
    .update(input)
    .digest("base64url");
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export function createAuthBootstrap(store: PlatformStore) {
  return {
    async start(input: {
      returnTo: string;
      codeChallenge: string;
    }): Promise<{ state: string; authorizeUrl: string }> {
      if (!isAllowedReturnTo(input.returnTo)) {
        throw new AuthError("INVALID_RETURN_TO", "return_to host not allowed");
      }
      if (input.codeChallenge.length < 16) {
        throw new AuthError("INVALID_CHALLENGE", "code_challenge too short");
      }
      const state = randomBytes(24).toString("base64url");
      const createdAt = nowIso();
      const expiresAt = new Date(Date.now() + 5 * 60_000).toISOString();
      const record: AuthBootstrapState = {
        state,
        codeChallenge: input.codeChallenge,
        codeChallengeMethod: "S256",
        returnTo: input.returnTo,
        nonce: randomBytes(16).toString("base64url"),
        createdAt,
        expiresAt,
      };
      await store.saveAuthState(state, record);
      return {
        state,
        authorizeUrl: `/api/auth/authorize?state=${encodeURIComponent(state)}`,
      };
    },

    /** Simulates successful login at auth origin; issues one-time code. */
    async completeLogin(input: {
      state: string;
      userId: string;
    }): Promise<{ code: string; returnTo: string }> {
      const raw = await store.getAuthState(input.state);
      if (!raw) throw new AuthError("INVALID_STATE", "unknown or expired state");
      const st = raw as AuthBootstrapState;
      if (new Date(st.expiresAt).getTime() < Date.now()) {
        throw new AuthError("EXPIRED_STATE", "state expired");
      }
      const code = randomBytes(32).toString("base64url");
      const record: AuthOneTimeCode = {
        code,
        userId: input.userId,
        returnTo: st.returnTo,
        codeChallenge: st.codeChallenge,
        used: false,
        createdAt: nowIso(),
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
      };
      await store.saveAuthCode(code, record);
      return { code, returnTo: st.returnTo };
    },

    async exchange(input: unknown): Promise<{ userId: string; returnTo: string }> {
      const req = AuthCodeExchangeRequestSchema.parse(input);
      const rawState = await store.getAuthState(req.state);
      if (!rawState) {
        throw new AuthError("INVALID_STATE", "unknown state");
      }
      const st = rawState as AuthBootstrapState;

      const expected = sha256Base64Url(req.codeVerifier);
      if (!timingSafeStringEqual(expected, st.codeChallenge)) {
        throw new AuthError("PKCE_MISMATCH", "code_verifier mismatch");
      }

      const rawCode = await store.consumeAuthCode(req.code);
      if (!rawCode) {
        throw new AuthError("INVALID_CODE", "code unknown, used, or expired");
      }
      const code = rawCode as AuthOneTimeCode;
      if (code.used) {
        throw new AuthError("CODE_REPLAY", "one-time code already used");
      }
      if (new Date(code.expiresAt).getTime() < Date.now()) {
        throw new AuthError("EXPIRED_CODE", "code expired");
      }
      if (code.codeChallenge !== st.codeChallenge) {
        throw new AuthError("STATE_CODE_MISMATCH", "state/code mismatch");
      }
      return { userId: code.userId, returnTo: code.returnTo };
    },
  };
}

export class AuthError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export function signGuestGrant(
  secret: string,
  claims: { courseId: string; releaseId: string; exp: number; iat: number },
): string {
  const payload = Buffer.from(
    JSON.stringify({ ...claims, typ: "guest_grant" }),
  ).toString("base64url");
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyGuestGrant(
  secret: string,
  token: string,
): { courseId: string; releaseId: string } | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
  if (!timingSafeStringEqual(sig, expected)) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (claims.typ !== "guest_grant") return null;
    if (typeof claims.exp !== "number" || claims.exp * 1000 < Date.now()) {
      return null;
    }
    return { courseId: claims.courseId, releaseId: claims.releaseId };
  } catch {
    return null;
  }
}

export { createId };
