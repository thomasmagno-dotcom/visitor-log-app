// Uses only Web Crypto (crypto.subtle) — compatible with Next.js Edge runtime

const COOKIE = "vg_admin_session";
const MAX_AGE = 60 * 60 * 8; // 8 hours

export { COOKIE, MAX_AGE };

async function getKey(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET ?? "fallback-dev-secret-change-me";
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signToken(payload: string): Promise<string> {
  const key = await getKey();
  const enc = new TextEncoder();
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${payload}.${hex}`;
}

export async function verifyToken(token: string): Promise<boolean> {
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return false;
  const payload = token.slice(0, lastDot);
  const actualHex = token.slice(lastDot + 1);

  const key = await getKey();
  const enc = new TextEncoder();
  const sigBytes = new Uint8Array(
    actualHex.match(/.{2}/g)?.map((h) => parseInt(h, 16)) ?? []
  );
  return crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(payload));
}
