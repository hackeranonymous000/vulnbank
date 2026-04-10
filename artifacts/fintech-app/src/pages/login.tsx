import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ShieldAlert, ArrowRight, Loader2, Terminal, ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const TEST_ACCOUNTS = [
  { username: "alice", password: "password123", role: "User", desc: "3 accounts, transactions" },
  { username: "bob", password: "password123", role: "User", desc: "2 accounts" },
  { username: "admin", password: "admin123", role: "Admin", desc: "Full admin access" },
];

export default function Login() {
  const [_, setLocation] = useLocation();
  const { login: setAuth } = useAuth();
  const { toast } = useToast();
  const loginMutation = useLogin();
  const [showHints, setShowHints] = useState(true);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await loginMutation.mutateAsync({ data });
      setAuth(response.user, response.token);
      toast({ title: "Authentication successful", description: `Welcome back, ${response.user.fullName}.` });
      setLocation("/dashboard");
    } catch (err: any) {
      const msg = err?.data?.error || err?.message || "Invalid username or password.";
      toast({ title: "Authentication failed", description: msg, variant: "destructive" });
    }
  };

  const quickLogin = (username: string, password: string) => {
    setValue("username", username);
    setValue("password", password);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-card border-r border-border p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="relative z-10 flex items-center gap-3 font-mono font-bold text-3xl tracking-tighter text-primary">
          <ShieldAlert className="h-10 w-10" />
          <span>VULNBANK</span>
        </div>
        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-semibold mb-6">Security-first digital banking for the modern professional.</h2>
          <p className="text-lg text-muted-foreground">
            Experience the future of finance with our zero-trust architecture and military-grade encryption.*
          </p>
          <p className="text-xs text-muted-foreground mt-8 opacity-50">
            * Claims may not be factually accurate. Built for security testing and educational purposes only.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
        <div className="w-full max-w-sm mx-auto space-y-6">
          <div className="lg:hidden flex items-center gap-2 font-mono font-bold text-2xl tracking-tighter text-primary mb-8">
            <ShieldAlert className="h-8 w-8" />
            <span>VULNBANK</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
            <p className="text-muted-foreground text-sm">Enter your credentials to access your account.</p>
          </div>

          {/* Test credentials hint */}
          <div className="rounded-lg border border-primary/30 bg-primary/5 overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
              onClick={() => setShowHints(!showHints)}
            >
              <span className="flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                Test credentials (click to autofill)
              </span>
              {showHints ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showHints && (
              <div className="border-t border-primary/20 divide-y divide-primary/10">
                {TEST_ACCOUNTS.map(acc => (
                  <button
                    key={acc.username}
                    type="button"
                    onClick={() => quickLogin(acc.username, acc.password)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-primary/10 transition-colors"
                  >
                    <div>
                      <span className="font-mono text-sm font-semibold text-foreground">{acc.username}</span>
                      <span className="text-xs text-muted-foreground ml-2">/ {acc.password}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${acc.role === "Admin" ? "bg-destructive/20 text-destructive" : "bg-secondary text-secondary-foreground"}`}>
                        {acc.role}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  data-testid="input-username"
                  placeholder="johndoe"
                  className="h-11 bg-black/20"
                  autoComplete="username"
                  {...register("username")}
                />
                {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  data-testid="input-password"
                  type="password"
                  placeholder="••••••••"
                  className="h-11 bg-black/20"
                  autoComplete="current-password"
                  {...register("password")}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
            </div>

            <Button
              type="submit"
              data-testid="button-login"
              className="w-full h-11 text-sm font-semibold"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sign in to VulnBank
              {!loginMutation.isPending && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline underline-offset-4 font-medium">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
