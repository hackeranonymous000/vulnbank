import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Button, Field, inputClass } from "@/components/app-ui";
import type { User } from "@/lib/types";

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api<{ token: string; user: User }>("/api/auth/register", {
        method: "POST",
        body: form,
      });
      login(response.user, response.token);
      toast.success("Account created — a $250 starter balance is waiting");
      setLocation("/dashboard");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Registration failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10">
      <div className="pointer-events-none absolute inset-0 terminal-grid opacity-[0.12]" />
      <div className="relative w-full max-w-[460px]">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>

        <div className="surface p-7 sm:p-8">
          <div className="mb-7 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-mint to-emerald-600 text-[#04110d]">
              <ShieldCheck className="h-5 w-5" strokeWidth={2.4} />
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Open an account</h1>
              <p className="text-xs text-muted-foreground">Instant onboarding — no branch visit needed.</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Field label="Full name" htmlFor="fullName">
              <input
                id="fullName"
                className={inputClass}
                placeholder="Alexis Moreau"
                value={form.fullName}
                onChange={update("fullName")}
                required
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Username" htmlFor="reg-username">
                <input
                  id="reg-username"
                  className={inputClass}
                  placeholder="alexis"
                  value={form.username}
                  onChange={update("username")}
                  required
                />
              </Field>
              <Field label="Email" htmlFor="reg-email">
                <input
                  id="reg-email"
                  type="email"
                  className={inputClass}
                  placeholder="alexis@example.com"
                  value={form.email}
                  onChange={update("email")}
                  required
                />
              </Field>
            </div>

            <Field label="Password" htmlFor="reg-password" hint="Use at least 8 characters.">
              <input
                id="reg-password"
                type="password"
                className={inputClass}
                placeholder="••••••••••"
                value={form.password}
                onChange={update("password")}
                required
              />
            </Field>

            {error && (
              <div className="rounded-xl border border-rose/25 bg-rose/[0.08] px-3 py-2 text-xs text-rose">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" loading={loading} className="w-full">
              Create account
            </Button>
          </form>

          <p className="mt-5 text-center text-[13px] text-muted-foreground">
            Already have one?{" "}
            <Link href="/" className="font-medium text-mint hover:underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground/60">
          Developed by <span className="font-semibold">Alexis</span> · local use only
        </p>
      </div>
    </div>
  );
}
