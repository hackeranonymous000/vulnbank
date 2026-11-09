import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { ArrowRight, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Button, Field, inputClass } from "@/components/app-ui";
import type { User } from "@/lib/types";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api<{ token: string; user: User | null }>("/api/auth/login", {
        method: "POST",
        body: { username, password },
      });
      const account =
        response.user ??
        (await api<User>("/api/users/me", {
          headers: { Authorization: `Bearer ${response.token}` },
        }));
      login(account, response.token);
      toast.success(`Welcome back, ${(account.fullName || account.username || "there").split(" ")[0]}`);
      setLocation("/dashboard");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Unable to reach the API";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 flex min-h-screen">
      {/* Brand column */}
      <section className="relative hidden w-[54%] flex-col justify-between overflow-hidden border-r border-white/[0.06] p-12 lg:flex">
        <div className="pointer-events-none absolute inset-0 terminal-grid opacity-[0.16]" />
        <div className="pointer-events-none absolute -left-32 top-24 h-[420px] w-[420px] animate-float rounded-full bg-mint/15 blur-[120px]" />
        <div className="pointer-events-none absolute -right-24 bottom-10 h-[380px] w-[380px] animate-float rounded-full bg-violet/20 blur-[130px]" />

        <div className="relative flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-mint to-emerald-600 text-[#04110d] shadow-[0_16px_40px_-18px_rgba(52,224,176,0.9)]">
            <ShieldCheck className="h-6 w-6" strokeWidth={2.4} />
          </span>
          <div>
            <p className="text-lg font-extrabold tracking-tight">VULNBANK</p>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground">
              PRIVATE BANKING
            </p>
          </div>
        </div>

        <div className="relative max-w-[520px]">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-mint" />
              Neobank · v2.0
          </span>
          <h1 className="mt-6 text-[46px] font-semibold leading-[1.05] tracking-[-0.03em]">
            Banking that
            <br />
            <span className="gradient-text">moves with you.</span>
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Open an account in seconds, move money instantly, and keep every card and
            transaction in one place.
          </p>

          <div className="mt-8 grid max-w-md grid-cols-3 gap-3">
            {[
              { value: "$0", label: "Monthly fee" },
              { value: "24/7", label: "Instant transfer" },
              { value: "100%", label: "Mobile ready" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                <p className="num text-xl font-semibold text-mint">{item.value}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-mint" />
            Sessions encrypted in transit
          </span>
          <span>
            Developed by <span className="font-semibold text-mint/80">Alexis</span>
          </span>
        </div>
      </section>

      {/* Form column */}
      <section className="flex w-full flex-col justify-center px-6 py-10 sm:px-12 lg:w-[46%] lg:px-16">
        <div className="mx-auto w-full max-w-[390px]">
          <div className="mb-9 flex items-center gap-3 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-mint to-emerald-600 text-[#04110d]">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="font-extrabold tracking-tight">VULNBANK</p>
              <p className="text-[10px] tracking-[0.16em] text-muted-foreground">PRIVATE BANKING</p>
            </div>
          </div>

          <div className="mb-7">
            <h2 className="text-[26px] font-semibold tracking-tight">Sign in</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Welcome back. Enter your details to continue.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Field label="Username" htmlFor="username">
              <input
                id="username"
                data-testid="input-username"
                className={inputClass}
                placeholder="alice"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Field>

            <Field label="Password" htmlFor="password">
              <input
                id="password"
                data-testid="input-password"
                type="password"
                className={inputClass}
                placeholder="••••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>

            {error && (
              <div className="rounded-xl border border-rose/25 bg-rose/[0.08] px-3 py-2 text-xs text-rose">
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              data-testid="button-login"
              loading={loading}
              className="w-full"
            >
              {!loading && <Lock className="h-4 w-4" />}
              Sign in
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-[13px] text-muted-foreground">
            No account?{" "}
            <Link href="/register" className="font-medium text-mint hover:underline underline-offset-4">
              Create one instantly
            </Link>
          </p>

          <p className="mt-10 text-center text-[11px] text-muted-foreground/60 lg:hidden">
            Developed by <span className="font-semibold">Alexis</span>
          </p>
        </div>
      </section>
    </div>
  );
}
