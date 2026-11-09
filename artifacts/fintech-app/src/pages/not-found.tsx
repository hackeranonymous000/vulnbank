import { Link } from "wouter";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="pointer-events-none absolute inset-0 terminal-grid opacity-[0.12]" />
      <div className="relative">
        <span className="label-xs">Error 404</span>
        <h1 className="num mt-4 text-7xl font-semibold tracking-tight">
          4<span className="text-mint">0</span>4
        </h1>
        <p className="mt-3 max-w-sm text-sm text-muted-foreground">
          We couldn't find the page you were looking for.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-mint px-4 py-2.5 text-sm font-semibold text-[#04110d] transition-all hover:brightness-110"
        >
          <Compass className="h-4 w-4" />
          Back to the dashboard
        </Link>
        <p className="mt-10 text-[11px] text-muted-foreground/60">
          Developed by <span className="font-semibold">Alexis</span>
        </p>
      </div>
    </div>
  );
}
