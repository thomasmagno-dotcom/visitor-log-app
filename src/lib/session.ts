import { createHmac } from "crypto";

const SECRET = process.env.SESSION_SECRET ?? "fallback-dev-secret-change-me";
const COOKIE = "vg_admin_session";
const MAX_AGE = 60 * 60 * 8; // 8 hours

export { COOKIE, MAX_AGE };

export function signToken(payload: string): string {
  const sig = createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyToken(token: string): boolean {
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return false;
  const payload = token.slice(0, lastDot);
  const expected = createHmac("sha256", SECRET).update(payload).digest("hex");
  const actual = token.slice(lastDot + 1);
  // Constant-time comparison
  if (expected.length !== actual.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ actual.charCodeAt(i);
  }
  return diff === 0;
}
