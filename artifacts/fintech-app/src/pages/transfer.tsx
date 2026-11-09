import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, Landmark, Search, Send, Wallet } from "lucide-react";
import { api, ApiError, formatCurrency } from "@/lib/api";
import { Badge, Button, EmptyState, Field, inputClass, PageHeader, Panel, Skeleton } from "@/components/app-ui";
import type { Account } from "@/lib/types";

interface TransferResult {
  success: boolean;
  transactionId: number;
  message: string;
  fromBalance: number;
  toBalance: number;
}

export default function Transfer() {
  const queryClient = useQueryClient();
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [recipient, setRecipient] = useState<Account | null>(null);

  const accountsQuery = useQuery({
    queryKey: ["accounts"],
    queryFn: () => api<Account[]>("/api/accounts"),
  });

  const accounts = accountsQuery.data ?? [];
  const source = accounts.find((account) => String(account.id) === fromAccountId);

  const lookup = useMutation({
    mutationFn: (id: number) => api<Account>(`/api/accounts/${id}`),
    onSuccess: (account) => {
      setRecipient(account);
      toast.success(`Recipient resolved to account #${account.id}`);
    },
    onError: (err) => {
      setRecipient(null);
      toast.error(err instanceof ApiError ? err.message : "Account not found");
    },
  });

  const transfer = useMutation({
    mutationFn: () =>
      api<TransferResult>("/api/transfers", {
        method: "POST",
        body: {
          fromAccountId: Number(fromAccountId),
          toAccountId: Number(toAccountId),
          amount,
          description: description || undefined,
        },
      }),
    onSuccess: (result) => {
      toast.success(`Sent — new source balance ${formatCurrency(result.fromBalance)}`);
      void queryClient.invalidateQueries({ queryKey: ["accounts"] });
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setAmount("");
      setDescription("");
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Transfer failed"),
  });

  const valid = fromAccountId && toAccountId && Number(amount) > 0;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Payments"
        title="Move money"
        description="Internal transfers settle instantly, any time of day."
      />

      <div className="grid gap-4 lg:grid-cols-12">
        <Panel className="lg:col-span-7" title="Transfer details" description="All amounts are in USD">
          {accountsQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : accounts.length === 0 ? (
            <EmptyState title="No accounts to send from" />
          ) : (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (valid) transfer.mutate();
              }}
            >
              <Field label="From account" htmlFor="from-account">
                <select
                  id="from-account"
                  className={inputClass}
                  value={fromAccountId}
                  onChange={(event) => setFromAccountId(event.target.value)}
                >
                  <option value="">Select an account…</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>                                {account.accountType} · ****{String(account.accountNumber).slice(-4)} · {formatCurrency(account.balance)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Destination account id"
                htmlFor="to-account"
                hint="Enter the destination account id."
              >
                <div className="flex gap-2">
                  <input
                    id="to-account"
                    className={inputClass}
                    placeholder="2"
                    value={toAccountId}
                    onChange={(event) => {
                      setToAccountId(event.target.value);
                      setRecipient(null);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => lookup.mutate(Number(toAccountId) || 0)}
                    loading={lookup.isPending}
                    className="shrink-0"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </Field>

              {recipient && (
                <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-mint/10 text-mint">
                    <Landmark className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="num text-xs">{recipient.accountNumber}</p>
                    <p className="text-[11px] capitalize text-muted-foreground">
                      {recipient.accountType} · owner #{recipient.userId}
                    </p>
                  </div>
                  <span className="num text-xs">{formatCurrency(recipient.balance)}</span>
                </div>
              )}

              <Field label="Amount" htmlFor="amount">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    $
                  </span>
                  <input
                    id="amount"
                    className={`${inputClass} pl-7`}
                    placeholder="250.00"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    inputMode="decimal"
                  />
                </div>
              </Field>

              <Field label="Description" htmlFor="description" hint="Shown on both statements.">
                <input
                  id="description"
                  className={inputClass}
                  placeholder="Rent, split dinner, …"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </Field>

              <Button type="submit" size="lg" loading={transfer.isPending} disabled={!valid} className="w-full">
                <Send className="h-4 w-4" />
                Send {amount ? formatCurrency(Number(amount) || 0) : "money"}
              </Button>
            </form>
          )}
        </Panel>

        <div className="space-y-4 lg:col-span-5">
          <Panel title="Preview" description="What the API will do">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">From</span>
                <span className="num text-xs">
                  {source ? `${source.accountType} · ${source.accountNumber}` : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Available</span>
                <span className="num text-xs">{formatCurrency(source?.balance ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">After transfer</span>
                <span className="num text-xs text-mint">
                  {formatCurrency((source?.balance ?? 0) - (Number(amount) || 0))}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                <span className="text-xs text-muted-foreground">Destination</span>
                <span className="num text-xs">
                  {recipient ? recipient.accountNumber : toAccountId ? `#${toAccountId}` : "—"}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-3 rounded-xl border border-white/[0.06] bg-black/20 py-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-mint/10 text-mint">
                <Wallet className="h-4 w-4" />
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet/10 text-violet">
                <Landmark className="h-4 w-4" />
              </span>
            </div>
          </Panel>

        </div>
      </div>
    </div>
  );
}
