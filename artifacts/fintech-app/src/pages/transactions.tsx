import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { api, formatCurrency, formatDate } from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";
import { Badge, EmptyState, PageHeader, Panel, Skeleton, inputClass } from "@/components/app-ui";
import type { Account, Transaction } from "@/lib/types";

export default function Transactions() {
  const [search, setSearch] = useState("");
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const debounced = useDebounce(search, 350);

  const accountsQuery = useQuery({
    queryKey: ["accounts"],
    queryFn: () => api<Account[]>("/api/accounts"),
  });

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (debounced) params.set("search", debounced);
    if (accountFilter !== "all") params.set("accountId", accountFilter);
    params.set("limit", "60");
    return `/api/transactions?${params.toString()}`;
  }, [debounced, accountFilter]);

  const txQuery = useQuery({
    queryKey: ["transactions", query],
    queryFn: () => api<Transaction[]>(query),
  });

  const accounts = accountsQuery.data ?? [];
  const transactions = txQuery.data ?? [];
  const accountLabel = (id: number) => {
    const account = accounts.find((a) => a.id === id);
    return account ? `${account.accountType} · ${account.accountNumber}` : `#${id}`;
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Ledger"
        title="Transactions"
        description="Search and filter every movement on your accounts."
      />

      <Panel bodyClassName="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search descriptions and categories…"
              className={`${inputClass} pl-9 pr-9`}
              data-testid="input-transaction-search"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <select
              value={accountFilter}
              onChange={(event) => setAccountFilter(event.target.value)}
              className={`${inputClass} w-full py-2 lg:w-56`}
            >
              <option value="all">All accounts</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.accountType} · {account.accountNumber}
                </option>
              ))}
            </select>
          </div>
        </div>

      </Panel>

      <Panel
        title="Results"
        description={`${transactions.length} rows${debounced ? ` matching “${debounced}”` : ""}`}
        bodyClassName="p-0"
        action={
          txQuery.isError ? (
            <Badge tone="amber">Unable to load</Badge>
          ) : null
        }
      >
        {txQuery.isLoading ? (
          <div className="space-y-2 p-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : txQuery.isError ? (
          <div className="p-4">
            <div className="rounded-xl border border-amber/25 bg-amber/[0.06] p-4">
              <p className="text-xs font-semibold text-amber">Ledger unavailable</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Try again in a moment.
              </p>
            </div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-4">
            <EmptyState title="No matching transactions" description="Try a different search term." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">ID</th>
                  <th className="px-5 py-3 font-semibold">Description</th>
                  <th className="px-5 py-3 font-semibold">Account</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 text-right font-semibold">Amount</th>
                  <th className="px-5 py-3 text-right font-semibold">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {transactions.map((tx, index) => {
                  const credit = tx.type === "credit";
                  return (
                    <tr key={`${tx.id}-${index}`} className="transition-colors hover:bg-white/[0.02]">
                      <td className="num px-5 py-3 text-[11px] text-muted-foreground">{tx.id}</td>
                      <td className="px-5 py-3">
                        <p className="font-medium">{tx.description}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge tone="outline">{tx.category}</Badge>
                          <span className="text-[10px] capitalize text-muted-foreground">{tx.type}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {accountLabel(tx.accountId)}
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {formatDate(tx.createdAt, true)}
                      </td>
                      <td className={`num px-5 py-3 text-right font-semibold ${credit ? "text-mint" : ""}`}>
                        {credit ? "+" : "−"}
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="num px-5 py-3 text-right text-xs text-muted-foreground">
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
