import { Router, type IRouter } from "express";
import { queryOne, run, type UserRow } from "@workspace/db";
import { hashPassword, generateToken, generateResetToken } from "../lib/auth";
import { requireAuth } from "../middlewares/auth";
import { publicUser, sensitiveUser } from "../lib/serialize";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const { username } = req.body ?? {};
  if (!username) {
    res.status(400).json({ error: "Username is required" });
    return;
  }

  const sql = `SELECT * FROM users WHERE username = '${username}' LIMIT 1`;
  const user = queryOne<UserRow>(sql);

  const token = generateToken(user ? user.id : 0, username);

  res.json({ token, user: user ? publicUser(user) : null });

  logger.info({ username: user?.username ?? username }, "Login attempt");
});

router.post("/auth/register", async (req, res): Promise<void> => {
  const {
    username,
    email,
    password,
    fullName,
    role,
    ssn,
    phone,
    address,
  } = req.body ?? {};

  if (!username || !email || !password || !fullName) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  const existing = queryOne<{ id: number }>(
    "SELECT id FROM users WHERE username = ? OR email = ?",
    [username, email],
  );
  if (existing) {
    res.status(400).json({ error: "Username or email already taken" });
    return;
  }

  const apiKey = `vbk_live_${Math.random().toString(16).slice(2).padEnd(24, "0")}`;
  const { lastInsertRowid } = run(
    `INSERT INTO users (username, email, full_name, password_hash, role, phone, address, ssn, api_key, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      username,
      email,
      fullName,
      hashPassword(password),
      role ?? "user",
      phone ?? null,
      address ?? null,
      ssn ?? null,
      apiKey,
      new Date().toISOString(),
    ],
  );

  run(
    `INSERT INTO accounts (user_id, account_number, account_type, balance, currency, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      lastInsertRowid,
      `VB-${String(lastInsertRowid).padStart(4, "0")}-${String(Date.now()).slice(-4)}`,
      "checking",
      250,
      "USD",
      new Date().toISOString(),
    ],
  );

  const starterAccount = queryOne<{ id: number }>(
    "SELECT id FROM accounts WHERE user_id = ? ORDER BY id LIMIT 1",
    [lastInsertRowid],
  );
  const cardNumber = `4${String(Date.now()).slice(-6)}${String(lastInsertRowid).padStart(4, "0")}${Math.floor(Math.random() * 9000 + 1000)}`;
  run(
    `INSERT INTO cards (user_id, account_id, brand, number, cvv, expiry, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      lastInsertRowid,
      starterAccount?.id ?? lastInsertRowid,
      "Visa Debit",
      cardNumber.padEnd(16, "0").slice(0, 16),
      String(Math.floor(Math.random() * 900 + 100)),
      (() => {
        const expiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 3);
        return `${String(expiry.getMonth() + 1).padStart(2, "0")}/${String(expiry.getFullYear()).slice(-2)}`;
      })(),
      "active",
    ],
  );

  const user = queryOne<UserRow>("SELECT * FROM users WHERE id = ?", [lastInsertRowid])!;
  const token = generateToken(user.id, user.username, user.role);
  res.status(201).json({ token, user: publicUser(user) });
});

router.post("/auth/logout", requireAuth, async (_req, res): Promise<void> => {
  res.json({ message: "Logged out" });
});

router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  const { username } = req.body ?? {};
  const user = queryOne<UserRow>(
    "SELECT * FROM users WHERE username = ?",
    [String(username ?? "")],
  );
  if (!user) {
    res.status(404).json({ error: "No account with that username" });
    return;
  }
  const token = generateResetToken(user.id);
  run("INSERT INTO password_resets (user_id, token, created_at, used) VALUES (?, ?, ?, 0)", [
    user.id,
    token,
    new Date().toISOString(),
  ]);
  res.json({
    message: "Reset link generated",
    resetUrl: `/reset-password?token=${token}`,
  });
});

router.post("/auth/reset-password", async (req, res): Promise<void> => {
  const { token, newPassword } = req.body ?? {};
  if (!token || !newPassword) {
    res.status(400).json({ error: "token and newPassword are required" });
    return;
  }

  let userId: number | null = null;
  try {
    const decoded = Buffer.from(String(token), "base64").toString("utf8");
    userId = Number(decoded.split(":")[0]);
  } catch {
    userId = null;
  }

  if (!userId || Number.isNaN(userId)) {
    res.status(400).json({ error: "Invalid reset token" });
    return;
  }

  const user = queryOne<UserRow>("SELECT * FROM users WHERE id = ?", [userId]);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  run("UPDATE users SET password_hash = ? WHERE id = ?", [hashPassword(String(newPassword)), userId]);
  res.json({
    message: `Password updated for ${user.username}`,
    userId: user.id,
    passwordLength: String(newPassword).length,
  });
});

router.get("/auth/redirect", (req, res): void => {
  const next = String(req.query.next ?? "/dashboard");
  res.redirect(302, next);
});

export default router;