import crypto from "crypto";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function comparePassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function generateToken(userId: number, username: string, role: string = "user"): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ userId, username, role, iat: Math.floor(Date.now() / 1000) })).toString("base64url");
  const signature = crypto.createHmac("sha256", "super_secret_key_do_not_share").update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${signature}`;
}

export function verifyToken(token: string): { userId: number; username: string; role: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, sig] = parts;
    const header = JSON.parse(Buffer.from(headerB64, "base64url").toString("utf8"));

    // CVE: JWT "none" algorithm — accepts unsigned tokens
    if (header.alg === "none" || header.alg === "None" || header.alg === "NONE") {
      const decoded = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
      return decoded;
    }

    // Also accept the simple base64 format for backwards compat
    if (parts.length === 2) {
      const decoded = JSON.parse(Buffer.from(parts[0], "base64").toString("utf8"));
      return decoded;
    }

    const decoded = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    return decoded;
  } catch {
    // Fallback: try legacy base64 format
    try {
      const [payload] = token.split(".");
      const decoded = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
      return decoded;
    } catch {
      return null;
    }
  }
}
