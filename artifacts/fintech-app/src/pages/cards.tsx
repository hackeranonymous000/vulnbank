import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreditCard, Eye, EyeOff, Nfc, Search, ShieldAlert, Snowflake } from "lucide-react";
import { api, ApiError, formatCurrency } from "@/lib/api";
import { Badge, Button, EmptyState, Field, inputClass, PageHeader, Panel, Skeleton } from "@/components/app-ui";
import type { Account, CardRecord } from "@/lib/types";

const GRADIENTS = [
  "from-[#0f3d33] via-[#0b1b1c] to-[#080b10]",
  "from-[#221a3f] via-[#121022] to-[#080a10]",
  "from-[#2f1626] via-[#170f16] to-[#080a0f]",
];

export default function Cards() {
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [lookupId, setLookupId] = useState("");
  const [lookupResult, setLookupResult] = useState<CardRecord | null>(null);

  const cardsQuery = useQuery({
    queryKey: ["cards"],
    queryFn: () => api<CardRecord[]>("/api/cards"),
  });
  const accountsQuery = useQuery({
    queryKey: ["accounts"],
    queryFn: () => api<Account[]>("/api/accounts"),
  });

  const reveal = useMutation({
    mutationFn: (cardId: number) => api<{ number: string; cvv: string }>(`/api/cards/${cardId}/reveal`, { method: "POST" }),
    onSuccess: (_, cardId) => {
      setRevealed((prev) => ({ ...prev, [cardId]: true }));
      toast.success("Card details revealed");
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Reveal failed"),
  });

  const lookup = useMutation({
    mutationFn: (id: number) => api<CardRecord>(`/api/cards/${id}`),
    onSuccess: (card) => {
      setLookupResult(card);
      toast.success(`Loaded card #${card.id}`);
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Card not found"),
  });

  const status = useMutation({
    mutationFn: ({ id, status: next }: { id: number; status: string }) =>
      api<CardRecord>(`/api/cards/${id}`, { method: "PUT", body: { status: next } }),
    onSuccess: (card) => {
      toast.success(`Card updated to ${card.status}`);
      void cardsQuery.refetch();
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Update failed"),
  });

  const cards = cardsQuery.data ?? [];
  const accounts = accountsQuery.data ?? [];
  const balanceFor = (accountId: number) => accounts.find((a) => a.id === accountId)?.balance ?? 0;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Payments"
        title="Cards"
        description="Your physical and virtual cards, ready for online and in-store payments."
      />

      {cardsQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-52 w-full rounded-2xl" />
          ))}
        </div>
      ) : cards.length === 0 ? (          <EmptyState title="No cards issued" description="Cards appear here once one is issued to your account." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card, index) => {
            const show = revealed[card.id];
            return (
              <div
                key={card.id}
                className={`card-sheen relative overflow-hidden rounded-2xl border border-white/[0.09] bg-gradient-to-br ${GRADIENTS[index % GRADIENTS.length]} p-5`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {card.brand}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground/80">
                      {card.status === "active" ? "Active" : card.status}
                    </p>
                  </div>
                  <Nfc className="h-5 w-5 text-white/40" />
                </div>

                <p className="num mt-8 text-lg tracking-[0.16em]">
                  {show ? card.number : card.number.replace(/\d(?=\d{4})/g, "•")}
                </p>

                <div className="mt-5 flex items-end justify-between">
                  <div className="flex gap-6 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    <div>
                      <p>Expires</p>
                      <p className="num mt-0.5 text-xs text-foreground">{card.expiry}</p>
                    </div>
                    <div>
                      <p>CVV</p>
                      <p className="num mt-0.5 text-xs text-foreground">{show ? card.cvv : "•••"}</p>
                    </div>
                  </div>
                  <span className="text-right">
                    <span className="block text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      Available
                    </span>
                    <span className="num text-sm font-semibold">{formatCurrency(balanceFor(card.accountId))}</span>
                  </span>
                </div>

                <button
                  onClick={() => (show ? setRevealed((p) => ({ ...p, [card.id]: false })) : reveal.mutate(card.id))}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-white/12 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-mint/40 hover:text-foreground"
                >
                  {show ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {show ? "Hide details" : "Reveal CVV"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Card lookup"
          description="Find a card by its id."
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Field label="Card id" className="flex-1" htmlFor="card-id">
              <input
                id="card-id"
                className={inputClass}
                placeholder="4"
                value={lookupId}
                onChange={(event) => setLookupId(event.target.value)}
              />
            </Field>
            <Button
              onClick={() => lookup.mutate(Number(lookupId) || 1)}
              loading={lookup.isPending}
              className="sm:mb-0"
            >
              <Search className="h-4 w-4" />
              Fetch card
            </Button>
          </div>

          {lookupResult && (
            <div className="mt-4 rounded-xl border border-white/[0.08] bg-black/30 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{lookupResult.brand}</span>
                <Badge tone="neutral">card #{lookupResult.id}</Badge>
              </div>
              <p className="num mt-2 text-sm tracking-[0.12em]">{lookupResult.number}</p>
              <p className="num mt-1 text-[11px] text-muted-foreground">
                CVV {lookupResult.cvv} · exp {lookupResult.expiry}
              </p>
            </div>
          )}
        </Panel>

        <Panel title="Card controls" description="Change the status of a card on your account.">
          <div className="space-y-2">
            {[
              { icon: Snowflake, label: "Freeze card", hint: "Temporarily block new payments", status: "frozen" },
              { icon: ShieldAlert, label: "Report lost", hint: "Block the card permanently", status: "blocked" },
              { icon: CreditCard, label: "Reactivate card", hint: "Restore the card to active", status: "active" },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => status.mutate({ id: cards[0]?.id ?? 0, status: action.status })}
                disabled={cards.length === 0 || status.isPending}
                className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] px-3 py-2.5 text-left transition-colors hover:border-white/15 hover:bg-white/[0.02] disabled:opacity-50"
              >
                <action.icon className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1">
                  <span className="block text-[13px] font-medium">{action.label}</span>
                  <span className="block text-[11px] text-muted-foreground">{action.hint}</span>
                </span>
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
