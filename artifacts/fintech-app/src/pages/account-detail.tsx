import { useParams, Link } from "wouter";
import { useGetAccount, useGetTransactions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDownRight, ArrowUpRight, Activity, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function AccountDetail() {
  const { accountId } = useParams();
  const id = parseInt(accountId || "0", 10);
  
  const { data: account, isLoading: isLoadingAccount } = useGetAccount(id, {
    query: { enabled: !!id }
  });

  const { data: transactions, isLoading: isLoadingTransactions } = useGetTransactions(
    { accountId: id },
    { query: { enabled: !!id } }
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/accounts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          {isLoadingAccount ? (
            <Skeleton className="h-8 w-64" />
          ) : (
            <h2 className="text-2xl font-bold tracking-tight capitalize">{account?.accountType} Account</h2>
          )}
          {isLoadingAccount ? (
            <Skeleton className="h-4 w-32 mt-1" />
          ) : (
            <p className="text-muted-foreground font-mono">Account #{account?.accountNumber}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 bg-primary text-primary-foreground border-primary">
          <CardHeader>
            <CardTitle className="text-primary-foreground/80 text-sm font-medium">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAccount ? (
              <Skeleton className="h-10 w-32 bg-primary-foreground/20" />
            ) : (
              <div className="text-4xl font-bold">{formatCurrency(account?.balance || 0)}</div>
            )}
            <div className="mt-4 text-xs text-primary-foreground/80">
              Currency: {account?.currency || "USD"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Recent activity for this account</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTransactions ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
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
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${tx.type === 'credit' ? 'text-emerald-500' : ''}`}>
                        {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Balance: {formatCurrency(tx.balanceAfter)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 text-muted-foreground border border-dashed rounded-lg">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No transactions found for this account.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
