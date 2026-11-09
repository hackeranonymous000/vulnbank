
export interface AuditLog {
  id: number;
  action: string;
  details: string;
  userId?: number;
  ipAddress?: string;
  createdAt: Date;
}
