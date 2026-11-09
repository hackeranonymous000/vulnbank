import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, ArrowUpRight, Landmark, PiggyBank, Plus, CreditCard } from "lucide-react";
import { api, formatCurrency } from "@/lib/api";
import { Badge, EmptyState, PageHeader, Panel, Skeleton } from "@/components/app-ui";
import type { Account } from "@/lib/types";

const STYLES: Record<string, { gradient: string; icon: typeof Landmark; label: string }> = {
  checking: {
    gradient: "from-[#0d2f27] via-[#0a1518] to-[#0a0e14]",
    icon: Landmark,
    label: "Everyday spending",
  },
  savings: {
    gradient: "from-[#171a3a] via-[#0c1020] to-[#080b12]",
    icon: PiggyBank,
    label: "Reserved funds",
  },
  credit: {
    gradient: "from-[#2c1024] via-[#150d16] to-[#080a0f]",
    icon: CreditCard,
    label: "Revolving credit",
  },
};

export default function Accounts() {
  const { data, isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => api<Account[]>("/api/accounts"),
  });

  const accounts = data ?? [];
  const total = accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Portfolio"
        title="Accounts"
        description="Every account on your profile with its live balance and routing details."
        actions={
          <Link
            href="/transfer"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-mint px-4 text-sm font-semibold text-[#04110d] transition-all hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            Move money
          </Link>
        }
      />

      <Panel className="flex flex-wrap items-center justify-between gap-3" bodyClassName="p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-mint/10 text-mint">
            <ArrowUpRight className="h-4 w-4" />
          </span>
          <div>
            <p className="label-xs">Combined balance</p>
            <p className="num text-lg font-semibold">{formatCurrency(total)}</p>
          </div>
        </div>
        <Badge tone="mint">USD</Badge>
      </Panel>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <EmptyState title="No accounts yet" description="Register a new customer to open a starter account." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => {
            const style = STYLES[account.accountType] ?? STYLES.checking!;
            const Icon = style.icon;
            return (
              <Link key={account.id} href={`/accounts/${account.id}`}>
                <article
                  className={`card-sheen group relative flex h-[196px] flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br ${style.gradient} p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-mint/30`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.05] text-mint">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-[13px] font-semibold capitalize">{account.accountType}</p>
                        <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          {style.label}
                        </p>
                      </div>
                    </div>
                    <Badge tone={account.accountType === "credit" ? "rose" : "mint"}>
                      {account.currency}
                    </Badge>
                  </div>

                  <div>
                    <p className="label-xs">Available</p>
                    <p className="num mt-1 text-[26px] font-semibold leading-none">
                      {formatCurrency(account.balance)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="num text-xs tracking-[0.12em] text-muted-foreground">
                      ****
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors group-hover:text-mint">
                      Open
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
