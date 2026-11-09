import * as zod from "zod";

export const HealthCheckResponse = zod.object({
  status: zod.string(),
});

export const LoginBody = zod.object({
  username: zod.string(),
  password: zod.string(),
});

export const LoginResponse = zod.object({
  token: zod.string(),
  user: zod.object({
    id: zod.number(),
    username: zod.string(),
    email: zod.string(),
    fullName: zod.string(),
    role: zod.enum(["user", "admin"]),
    createdAt: zod.coerce.date(),
  }),
});

export const RegisterBody = zod.object({
  username: zod.string(),
  email: zod.string(),
  password: zod.string(),
  fullName: zod.string(),
});

export const GetMeResponse = zod.object({
  id: zod.number(),
  username: zod.string(),
  email: zod.string(),
  fullName: zod.string(),
  role: zod.enum(["user", "admin"]),
  createdAt: zod.coerce.date(),
});

export const GetUserParams = zod.object({
  userId: zod.coerce.number(),
});

export const GetUserResponse = zod.object({
  id: zod.number(),
  username: zod.string(),
  email: zod.string(),
  fullName: zod.string(),
  role: zod.enum(["user", "admin"]),
  createdAt: zod.coerce.date(),
});

export const UpdateUserParams = zod.object({
  userId: zod.coerce.number(),
});

export const UpdateUserBody = zod.object({
  email: zod.string().optional(),
  fullName: zod.string().optional(),
  phone: zod.string().optional(),
  address: zod.string().optional(),
});

export const UpdateUserResponse = zod.object({
  id: zod.number(),
  username: zod.string(),
  email: zod.string(),
  fullName: zod.string(),
  role: zod.enum(["user", "admin"]),
  createdAt: zod.coerce.date(),
});

export const GetAccountsResponseItem = zod.object({
  id: zod.number(),
  userId: zod.number(),
  accountNumber: zod.string(),
  accountType: zod.enum(["checking", "savings", "investment"]),
  balance: zod.number(),
  currency: zod.string(),
  createdAt: zod.coerce.date(),
});
export const GetAccountsResponse = zod.array(GetAccountsResponseItem);

export const GetAccountParams = zod.object({
  accountId: zod.coerce.number(),
});

export const GetAccountResponse = zod.object({
  id: zod.number(),
  userId: zod.number(),
  accountNumber: zod.string(),
  accountType: zod.enum(["checking", "savings", "investment"]),
  balance: zod.number(),
  currency: zod.string(),
  createdAt: zod.coerce.date(),
});

export const getTransactionsQueryLimitDefault = 20;

export const GetTransactionsQueryParams = zod.object({
  accountId: zod.coerce.number().optional(),
  search: zod.coerce
    .string()
    .optional()
    .describe("Search term"),
  limit: zod.coerce.number().default(getTransactionsQueryLimitDefault),
});

export const GetTransactionsResponseItem = zod.object({
  id: zod.number(),
  accountId: zod.number(),
  type: zod.enum(["credit", "debit", "transfer"]),
  amount: zod.number(),
  description: zod.string(),
  category: zod.string(),
  balanceAfter: zod.number(),
  createdAt: zod.coerce.date(),
});
export const GetTransactionsResponse = zod.array(GetTransactionsResponseItem);

export const GetTransactionParams = zod.object({
  transactionId: zod.coerce.number(),
});

export const GetTransactionResponse = zod.object({
  id: zod.number(),
  accountId: zod.number(),
  type: zod.enum(["credit", "debit", "transfer"]),
  amount: zod.number(),
  description: zod.string(),
  category: zod.string(),
  balanceAfter: zod.number(),
  createdAt: zod.coerce.date(),
});

export const CreateTransferBody = zod.object({
  fromAccountId: zod.number(),
  toAccountId: zod.number(),
  amount: zod.number(),
  description: zod.string().optional(),
});

export const CreateTransferResponse = zod.object({
  success: zod.boolean(),
  transactionId: zod.number().optional(),
  message: zod.string(),
});

export const GetDashboardSummaryResponse = zod.object({
  totalBalance: zod.number(),
  totalAccounts: zod.number(),
  monthlyIncome: zod.number(),
  monthlyExpenses: zod.number(),
  savingsRate: zod.number(),
  accountBreakdown: zod.array(
    zod.object({
      type: zod.string(),
      balance: zod.number(),
      count: zod.number(),
    }),
  ),
});

export const GetRecentActivityResponseItem = zod.object({
  id: zod.number(),
  accountId: zod.number(),
  type: zod.enum(["credit", "debit", "transfer"]),
  amount: zod.number(),
  description: zod.string(),
  category: zod.string(),
  balanceAfter: zod.number(),
  createdAt: zod.coerce.date(),
});
export const GetRecentActivityResponse = zod.array(
  GetRecentActivityResponseItem,
);

export const AdminGetUsersResponseItem = zod.object({
  id: zod.number(),
  username: zod.string(),
  email: zod.string(),
  fullName: zod.string(),
  role: zod.enum(["user", "admin"]),
  createdAt: zod.coerce.date(),
});
export const AdminGetUsersResponse = zod.array(AdminGetUsersResponseItem);

export const AdminResetPasswordParams = zod.object({
  userId: zod.coerce.number(),
});

export const AdminResetPasswordBody = zod.object({
  newPassword: zod.string(),
});

export const AdminResetPasswordResponse = zod.object({
  message: zod.string(),
});

export const AdminGetStatsResponse = zod.object({
  totalUsers: zod.number(),
  totalAccounts: zod.number(),
  totalTransactions: zod.number(),
  totalVolume: zod.number(),
  activeUsers: zod.number(),
  flaggedTransactions: zod.number(),
  newUsersToday: zod.number(),
  volumeToday: zod.number(),
});

export const AdminGetAuditLogsResponseItem = zod.object({
  id: zod.number(),
  action: zod.string(),
  details: zod.string(),
  userId: zod.number().optional(),
  ipAddress: zod.string().optional(),
  createdAt: zod.coerce.date(),
});
export const AdminGetAuditLogsResponse = zod.array(
  AdminGetAuditLogsResponseItem,
);

export const AdminCreateAuditLogBody = zod.object({
  action: zod.string(),
  details: zod.string(),
});

export const adminGetTransactionsQueryLimitDefault = 50;

export const AdminGetTransactionsQueryParams = zod.object({
  limit: zod.coerce.number().default(adminGetTransactionsQueryLimitDefault),
});

export const AdminGetTransactionsResponseItem = zod.object({
  id: zod.number(),
  accountId: zod.number(),
  userId: zod.number(),
  username: zod.string(),
  type: zod.string(),
  amount: zod.number(),
  description: zod.string(),
  category: zod.string(),
  balanceAfter: zod.number(),
  createdAt: zod.coerce.date(),
});
export const AdminGetTransactionsResponse = zod.array(
  AdminGetTransactionsResponseItem,
);

export const WebhookNotifyBody = zod.object({
  url: zod.string(),
  event: zod.string(),
  payload: zod.object({}).passthrough().optional(),
});

export const WebhookNotifyResponse = zod.object({
  success: zod.boolean(),
  statusCode: zod.number().optional(),
  responseBody: zod.string().optional(),
  message: zod.string(),
});
