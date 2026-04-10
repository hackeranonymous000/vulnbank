import { useGetAccounts } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, CreditCard, Building2, TrendingUp } from "lucide-react";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function AccountIcon({ type }: { type: string }) {
  switch (type) {
    case "checking":
      return <CreditCard className="h-6 w-6 text-primary" />;
    case "savings":
      return <Building2 className="h-6 w-6 text-primary" />;
    case "investment":
      return <TrendingUp className="h-6 w-6 text-primary" />;
    default:
      return <CreditCard className="h-6 w-6 text-primary" />;
  }
}

export default function Accounts() {
  const { data: accounts, isLoading } = useGetAccounts();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Your Accounts</h2>
        <p className="text-muted-foreground">Manage your balances and transaction history.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-40 mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts?.map((account: any) => (
            <Link key={account.id} href={`/accounts/${account.id}`}>
              <Card className="hover:bg-card/90 hover:border-primary/50 transition-all cursor-pointer h-full flex flex-col group">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg capitalize">{account.accountType} Account</CardTitle>
                    <CardDescription className="font-mono">•••• {account.accountNumber.slice(-4)}</CardDescription>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                    <AccountIcon type={account.accountType} />
                  </div>
                </CardHeader>
                <CardContent className="mt-auto pt-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Available Balance</div>
                      <div className="text-3xl font-bold">{formatCurrency(account.balance)}</div>
                    </div>
                    <div className="text-muted-foreground group-hover:text-primary transition-colors">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
