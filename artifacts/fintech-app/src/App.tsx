import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Accounts from "@/pages/accounts";
import AccountDetail from "@/pages/account-detail";
import Transactions from "@/pages/transactions";
import Transfer from "@/pages/transfer";
import Cards from "@/pages/cards";
import Profile from "@/pages/profile";
import Admin from "@/pages/admin";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function Protected({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!token) setLocation("/");
  }, [token, setLocation]);

  if (!token) return null;

  return <AppLayout>{children}</AppLayout>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/register" component={Register} />

      <Route path="/dashboard">
        <Protected>
          <Dashboard />
        </Protected>
      </Route>
      <Route path="/accounts">
        <Protected>
          <Accounts />
        </Protected>
      </Route>
      <Route path="/accounts/:accountId">
        <Protected>
          <AccountDetail />
        </Protected>
      </Route>
      <Route path="/cards">
        <Protected>
          <Cards />
        </Protected>
      </Route>
      <Route path="/transactions">
        <Protected>
          <Transactions />
        </Protected>
      </Route>
      <Route path="/transfer">
        <Protected>
          <Transfer />
        </Protected>
      </Route>
      <Route path="/profile">
        <Protected>
          <Profile />
        </Protected>
      </Route>
      <Route path="/profile/:userId">
        <Protected>
          <Profile />
        </Protected>
      </Route>
      <Route path="/admin">
        <Protected>
          <Admin />
        </Protected>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "#0c1017",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#e8edf4",
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
