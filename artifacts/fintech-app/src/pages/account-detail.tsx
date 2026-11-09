import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowRight, ArrowUpRight, Copy, Landmark } from "lucide-react";
import { api, formatCurrency, formatDate } from "@/lib/api";
import { Badge, EmptyState, Panel, Skeleton } from "@/components/app-ui";
import type { Account, Transaction } from "@/lib/types";

export default function AccountDetail() {
  const { accountId } = useParams();
  const id = parseInt(accountId ?? "0", 10);

  const accountQuery = useQuery({
    queryKey: ["account", id],
    queryFn: () => api<Account>(`/api/accounts/${id}`),
    enabled: id > 0,
  });
  const txQuery = useQuery({
    queryKey: ["transactions", { accountId: id }],
    queryFn: () => api<Transaction[]>(`/api/transactions?accountId=${id}&limit=50`),
    enabled: id > 0,
  });

  const account = accountQuery.data;
  const transactions = txQuery.data ?? [];

  return (
    <div className="space-y-5">
      <Link
        href="/accounts"
        className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All accounts
      </Link>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="card-sheen relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[linear-gradient(135deg,rgba(52,224,176,0.14),rgba(12,18,26,0.94)_46%,rgba(139,125,255,0.16))] p-6 lg:col-span-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="label-xs">Account balance</p>
              {accountQuery.isLoading ? (
                <Skeleton className="mt-3 h-10 w-48" />
              ) : (
                <p className="num mt-3 text-[38px] font-semibold leading-none">
                  {formatCurrency(account?.balance ?? 0)}
                </p>
              )}
              <p className="num mt-4 text-xs tracking-[0.14em] text-muted-foreground">
                {account?.accountNumber ?? "—"}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge tone={account?.accountType === "credit" ? "rose" : "mint"}>
                {account?.accountType?.toUpperCase() ?? "—"}
              </Badge>
              <Badge tone="outline">{account?.currency ?? "USD"}</Badge>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            <Link
              href="/transfer"
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-mint px-3.5 text-xs font-semibold text-[#04110d] hover:brightness-110"
            >
              Transfer from here
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href={`/accounts/${(id || 1) + 1}`}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3.5 text-xs font-medium text-muted-foreground transition-colors hover:border-rose/40 hover:text-rose"
            >
              Next account id
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <Panel title="Account facts" className="lg:col-span-4" bodyClassName="space-y-3 p-5">
          {[
            { label: "Owner id", value: account?.userId ?? "—" },
            { label: "Type", value: account?.accountType ?? "—" },
            { label: "Routing", value: "121000358" },
            { label: "Opened", value: account ? formatDate(account.createdAt) : "—" },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{row.label}</span>
              <span className="num capitalize">{row.value}</span>
            </div>
          ))}
        </Panel>
      </div>

      <Panel
        title="Ledger"
        description={`${transactions.length} transactions on this account`}
        bodyClassName="p-0"
        action={
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <Copy className="h-3 w-3" /> GET /api/transactions?accountId={id}
          </span>
        }
      >
        {txQuery.isLoading ? (
          <div className="space-y-2 p-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-4">
            <EmptyState title="No transactions" icon={<Landmark className="h-6 w-6" />} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">Description</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 text-right font-semibold">Amount</th>
                  <th className="px-5 py-3 text-right font-semibold">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {transactions.map((tx) => {
                  const credit = tx.type === "credit";
                  return (
                    <tr key={tx.id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="px-5 py-3.5">
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-[11px] capitalize text-muted-foreground">{tx.type}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge tone="outline">{tx.category}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">
                        {formatDate(tx.createdAt, true)}
                      </td>
                      <td className={`num px-5 py-3.5 text-right font-semibold ${credit ? "text-mint" : ""}`}>
                        {credit ? "+" : "−"}
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="num px-5 py-3.5 text-right text-xs text-muted-foreground">
                        {formatCurrency(tx.balanceAfter)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
