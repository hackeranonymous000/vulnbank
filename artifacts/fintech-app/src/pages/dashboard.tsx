import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Landmark,
  PiggyBank,
  Receipt,
  Wallet,
} from "lucide-react";
import { api, formatCurrency, formatDate } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Badge, EmptyState, PageHeader, Panel, Skeleton } from "@/components/app-ui";
import type { Account, DashboardSummary, Transaction } from "@/lib/types";

const PIE_COLORS = ["#34e0b0", "#8b7cf6", "#5b8def", "#e0b341", "#e05c7a"];
const ACCOUNT_ICONS: Record<string, typeof Landmark> = {
  checking: Wallet,
  savings: PiggyBank,
  credit: Landmark,
};

export default function Dashboard() {
  const { user } = useAuth();

  const summaryQuery = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () => api<DashboardSummary>("/api/dashboard/summary"),
  });

  const accountsQuery = useQuery({
    queryKey: ["accounts"],
    queryFn: () => api<Account[]>("/api/accounts"),
  });

  const activityQuery = useQuery({
    queryKey: ["dashboard", "recent"],
    queryFn: () => api<Transaction[]>("/api/dashboard/recent-activity"),
  });

  const summary = summaryQuery.data;
  const accounts = accountsQuery.data ?? [];
  const activity = activityQuery.data ?? [];
  const spending = (summary?.spendingByCategory ?? []).slice(0, 5);
  const flow = summary?.dailyFlow ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back${user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}`}
        description="Your balances, cash flow and latest movement in one place."
        actions={
          <Link
            href="/transfer"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-mint px-4 text-sm font-semibold text-[#04110d] transition-all hover:brightness-110"
          >
            <ArrowRight className="h-4 w-4" />
            Move money
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total balance", value: summary?.totalBalance, tone: "text-mint" },
          { label: "Accounts", value: summary?.totalAccounts, tone: "text-foreground", raw: true },
          { label: "Income this month", value: summary?.monthlyIncome, tone: "text-mint" },
          { label: "Spent this month", value: summary?.monthlyExpenses, tone: "text-rose" },
        ].map((stat) => (
          <div key={stat.label} className="surface p-4">
            <p className="label-xs">{stat.label}</p>
            <p className={`num mt-2 text-[22px] font-semibold leading-none ${stat.tone}`}>
              {summaryQuery.isLoading
                ? "—"
                : stat.raw
                  ? String(stat.value ?? 0)
                  : formatCurrency(Number(stat.value ?? 0))}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Panel
          className="lg:col-span-7"
          title="Cash flow"
          description="Net movement across your accounts this month."
          action={<Badge tone="mint">{flow.length} days</Badge>}
        >
          {summaryQuery.isLoading ? (
            <Skeleton className="h-[220px] w-full" />
          ) : flow.length === 0 ? (
            <EmptyState title="No activity yet" description="Transfers and deposits will show up here." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={flow} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="flow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34e0b0" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#34e0b0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#8b97a8", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: string) => value.slice(5)}
                />
                <YAxis tick={{ fill: "#8b97a8", fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#0c1017",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Area
                  type="monotone"
                  dataKey="net"
                  stroke="#34e0b0"
                  strokeWidth={2}
                  fill="url(#flow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Panel>

        <Panel
          className="lg:col-span-5"
          title="Spending mix"
          description="Where the money went this month."
        >
          {summaryQuery.isLoading ? (
            <Skeleton className="h-[220px] w-full" />
          ) : spending.length === 0 ? (
            <EmptyState title="Nothing to chart yet" />
          ) : (
            <div className="flex items-center gap-3">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie
                    data={spending}
                    dataKey="total"
                    nameKey="category"
                    innerRadius={46}
                    outerRadius={78}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {spending.map((entry, index) => (
                      <Cell key={entry.category} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#0c1017",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
              <ul className="flex-1 space-y-1.5">
                {spending.map((entry, index) => (
                  <li key={entry.category} className="flex items-center gap-2 text-[11px]">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    <span className="flex-1 truncate capitalize text-muted-foreground">
                      {entry.category}
                    </span>
                    <span className="num">{formatCurrency(entry.total)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Panel
          className="lg:col-span-5"
          title="Your accounts"
          action={
            <Link href="/accounts" className="text-[11px] font-medium text-mint hover:underline">
              View all
            </Link>
          }
        >
          {accountsQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : accounts.length === 0 ? (
            <EmptyState title="No accounts" description="Open a new account to get started." />
          ) : (
            <ul className="space-y-2">
              {accounts.slice(0, 4).map((account) => {
                const Icon = ACCOUNT_ICONS[account.accountType] ?? Landmark;
                return (
                  <li key={account.id}>
                    <Link
                      href={`/accounts/${account.id}`}
                      className="flex items-center gap-3 rounded-xl border border-white/[0.06] px-3 py-2.5 transition-colors hover:border-mint/25 hover:bg-white/[0.02]"
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-mint/10 text-mint">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium capitalize">{account.accountType}</p>
                        <p className="num text-[10px] text-muted-foreground">****{String(account.accountNumber).slice(-4)}</p>
                      </div>
                      <span className="num text-[13px] font-semibold">
                        {formatCurrency(account.balance)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel
          className="lg:col-span-7"
          title="Recent activity"
          action={
            <Link href="/transactions" className="text-[11px] font-medium text-mint hover:underline">
              Full ledger
            </Link>
          }
        >
          {activityQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : activity.length === 0 ? (
            <EmptyState title="No transactions yet" icon={<Receipt className="h-4 w-4" />} />
          ) : (
            <ul className="divide-y divide-white/[0.05]">
              {activity.map((tx) => {
                const incoming = tx.type === "credit";
                const Icon = incoming ? ArrowDownLeft : ArrowUpRight;
                return (
                  <li key={tx.id} className="flex items-center gap-3 py-2.5">
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-lg ${
                        incoming ? "bg-mint/10 text-mint" : "bg-rose/10 text-rose"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium">{tx.description}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDate(tx.createdAt)} · {tx.category}
                      </p>
                    </div>
                    <span className={`num text-[13px] font-semibold ${incoming ? "text-mint" : "text-foreground"}`}>
                      {incoming ? "+" : "-"}
                      {formatCurrency(Math.abs(tx.amount))}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
