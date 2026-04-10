import { useState } from "react";
import { useGetTransactions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDownRight, ArrowUpRight, Activity, Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(new Date(dateStr));
}

// Add simple debounce hook since it might be missing
function useLocalDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useState(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  });
  
  return debouncedValue;
}

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState("");
  // Intentionally vulnerable to SQL injection - we debounce to avoid hammering the API
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Custom effect to handle debounce instead of hook to be safe
  useState(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  });

  const { data: transactions, isLoading } = useGetTransactions({
    search: debouncedSearch || undefined,
    limit: 100
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">All Transactions</h2>
        <p className="text-muted-foreground">View and search your complete transaction history across all accounts.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Recent activity</CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="search transactions..." // Vulnerable to SQL injection prompt
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 font-mono bg-black/20"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <div className="space-y-4">
              {transactions && transactions.length > 0 ? (
                transactions.map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${tx.type === 'credit' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-destructive/20 text-destructive'}`}>
                        {tx.type === 'credit' ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(tx.createdAt)} • {tx.category}</p>
                        {tx.accountId && <p className="text-xs text-muted-foreground font-mono mt-1">Acc: {tx.accountId}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${tx.type === 'credit' ? 'text-emerald-500' : ''}`}>
                        {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Bal: {formatCurrency(tx.balanceAfter)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-12 text-muted-foreground border border-dashed rounded-lg">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No transactions found.</p>
                  {debouncedSearch && <p className="text-sm mt-2 text-destructive font-mono">Query returned no results.</p>}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
