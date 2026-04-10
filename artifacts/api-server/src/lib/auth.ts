import crypto from "crypto";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function comparePassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function generateToken(userId: number, username: string): string {
  const payload = Buffer.from(JSON.stringify({ userId, username, iat: Date.now() })).toString("base64");
  const signature = crypto.createHmac("sha256", "super_secret_key_do_not_share").update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export function verifyToken(token: string): { userId: number; username: string } | null {
  try {
    const [payload] = token.split(".");
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
    return decoded;
  } catch {
    return null;
  }
}
