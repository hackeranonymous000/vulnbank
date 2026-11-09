import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowLeftRight,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  ShieldCheck,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { initials } from "@/lib/api";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/transactions", label: "Activity", icon: Receipt },
  { href: "/transfer", label: "Move money", icon: ArrowLeftRight },
  { href: "/cards", label: "Cards", icon: CreditCard },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [pathname] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const avatar = (
    <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-mint to-emerald-600 text-xs font-bold text-[#04110d]">
      {initials(user?.fullName)}
    </span>
  );

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors",
              active
                ? "bg-mint/10 text-mint"
                : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
      {user?.role === "admin" && (
        <Link
          href="/admin"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors",
            isActive("/admin")
              ? "bg-violet/10 text-violet"
              : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
          )}
        >
          <ShieldCheck className="h-4 w-4" />
          Admin
        </Link>
      )}
    </nav>
  );

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#080b10]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1500px] items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-mint to-emerald-600 text-[#04110d]">
              <ShieldCheck className="h-4 w-4" strokeWidth={2.4} />
            </span>
            <span className="text-sm font-extrabold tracking-tight">VULNBANK</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="hidden items-center gap-2 rounded-xl border border-white/[0.07] px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-white/15 hover:text-foreground sm:flex"
            >
              {avatar}
              <span className="max-w-[140px] truncate font-medium">
                {user?.fullName || "Account"}
              </span>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="hidden items-center gap-1.5 rounded-xl border border-white/[0.07] px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-rose/30 hover:text-rose sm:flex"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.07] text-muted-foreground lg:hidden"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1500px] gap-6 px-4 py-6 sm:px-6">
        <aside className="hidden w-[212px] shrink-0 lg:block">
          <div className="sticky top-20 space-y-4">
            <div className="surface p-3">
              <div className="mb-3 flex items-center gap-2.5 px-1">
                {avatar}
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold">
                    {user?.fullName || "Account"}
                  </p>
                  <p className="truncate text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {user?.role || "customer"}
                  </p>
                </div>
              </div>
              {nav}
            </div>
            <p className="px-1 text-[10px] leading-relaxed text-muted-foreground/50">
              Developed by Alexis
            </p>
          </div>
        </aside>

        {mobileOpen && (
          <div className="fixed inset-x-0 top-14 z-20 border-b border-white/[0.06] bg-[#080b10] p-3 lg:hidden">
            {nav}
            <button
              type="button"
              onClick={logout}
              className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium text-muted-foreground"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        )}

        <main className="min-w-0 flex-1 pb-10">{children}</main>
      </div>
    </div>
  );
}

export default AppLayout;
