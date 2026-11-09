import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/auth";
import { queryOne, type UserRow } from "@workspace/db";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      userRole?: string;
      user?: UserRow;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7);
  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  const user = queryOne<UserRow>("SELECT * FROM users WHERE id = ?", [decoded.userId]);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  req.userId = user.id;
  req.userRole = user.role;
  req.user = user;
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (req.userRole !== "admin") {
    res.status(403).json({ error: "Admin only" });
    return;
  }
  next();
}
