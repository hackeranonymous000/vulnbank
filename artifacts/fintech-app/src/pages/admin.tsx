import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Receipt, Users } from "lucide-react";
import { api, formatCurrency, formatDate } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import {
  Badge,
  EmptyState,
  PageHeader,
  Panel,
  Skeleton,
} from "@/components/app-ui";

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AdminTransaction {
  id: number;
  accountId: number;
  userId: number;
  type: string;
  amount: number;
  description: string;
  category: string;
  createdAt: string;
}

export default function Admin() {
  const { user } = useAuth();

  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => api<{ users: AdminUser[] }>("/api/admin/users"),
  });

  const txQuery = useQuery({
    queryKey: ["admin", "transactions"],
    queryFn: () => api<{ transactions: AdminTransaction[] }>("/api/admin/transactions"),
  });

  const users = usersQuery.data?.users ?? [];
  const transactions = txQuery.data?.transactions ?? [];
  const volume = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Operations"
        title="Admin console"
        description="Customer directory and the platform-wide transaction ledger."
        actions={
          <Badge tone={user?.role === "admin" ? "mint" : "violet"}>
            {user?.role ?? "customer"}
          </Badge>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Customers", value: String(users.length), icon: Users },
          { label: "Transactions", value: String(transactions.length), icon: Receipt },
          { label: "Ledger volume", value: formatCurrency(volume), icon: AlertTriangle },
        ].map((stat) => (
          <div key={stat.label} className="surface flex items-center gap-3 p-4">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet/10 text-violet">
              <stat.icon className="h-4 w-4" />
            </span>
            <div>
              <p className="label-xs">{stat.label}</p>
              <p className="num mt-0.5 text-lg font-semibold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <Panel title="Customer directory" description="Every registered account on this instance.">
        {usersQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : usersQuery.isError ? (
          <EmptyState title="Directory unavailable" description="The request was rejected or failed." />
        ) : users.length === 0 ? (
          <EmptyState title="No customers yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Id</th>
                  <th className="pb-2 pr-4 font-medium">Account</th>
                  <th className="pb-2 pr-4 font-medium">Email</th>
                  <th className="pb-2 font-medium">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {users.map((row) => (
                  <tr key={row.id}>
                    <td className="num py-2 pr-4 text-muted-foreground">{row.id}</td>
                    <td className="py-2 pr-4 font-medium">{row.username}</td>
                    <td className="truncate py-2 pr-4 text-muted-foreground">{row.email}</td>
                    <td className="py-2">
                      <Badge tone={row.role === "admin" ? "violet" : "neutral"}>{row.role}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel title="Platform ledger" description="Most recent movement across all customers.">
        {txQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : txQuery.isError ? (
          <EmptyState title="Ledger unavailable" />
        ) : transactions.length === 0 ? (
          <EmptyState title="Nothing recorded" />
        ) : (
          <ul className="divide-y divide-white/[0.05]">
            {transactions.slice(0, 25).map((tx) => (
              <li key={tx.id} className="flex items-center gap-3 py-2.5">
                <Badge tone={tx.type === "credit" ? "mint" : "neutral"}>{tx.type}</Badge>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">{tx.description}</p>
                  <p className="text-[10px] text-muted-foreground">
                    account #{tx.accountId} · user #{tx.userId} · {formatDate(tx.createdAt)}
                  </p>
                </div>
                <span className="num text-[13px] font-semibold">{formatCurrency(Number(tx.amount))}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
