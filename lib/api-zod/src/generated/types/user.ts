import type { UserRole } from "./userRole";

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: Date;
}
