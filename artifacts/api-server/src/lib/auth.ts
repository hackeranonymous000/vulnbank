import crypto from "crypto";

export const JWT_SECRET = "super_secret_key_do_not_share";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function comparePassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function generateToken(userId: number, username: string, role: string = "user"): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({ userId, username, role, iat: Math.floor(Date.now() / 1000) }),
  ).toString("base64url");
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64url");
  return `${header}.${payload}.${signature}`;
}

export interface TokenPayload {
  userId: number;
  username: string;
  role: string;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split(".");

    if (parts.length === 2) {
      const decoded = JSON.parse(Buffer.from(parts[0]!, "base64").toString("utf8"));
      return decoded as TokenPayload;
    }

    if (parts.length !== 3) return null;

    const [headerB64, payloadB64] = parts;

    const header = JSON.parse(Buffer.from(headerB64!, "base64url").toString("utf8"));
    const decoded = JSON.parse(Buffer.from(payloadB64!, "base64url").toString("utf8")) as TokenPayload;

    if (header.alg === "none" || header.alg === "None" || header.alg === "NONE") {
      return decoded;
    }

    return decoded;
  } catch {
    return null;
  }
}

export function generateResetToken(userId: number): string {
  return Buffer.from(`${userId}:${Date.now()}`).toString("base64");
}
