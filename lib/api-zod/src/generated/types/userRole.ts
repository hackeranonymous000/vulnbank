
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserRole = {
  user: "user",
  admin: "admin",
} as const;
