import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ layout */

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="label-xs mb-2">{eyebrow}</p>}
        <h2 className="text-2xl font-semibold tracking-tight sm:text-[28px]">{title}</h2>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("surface overflow-hidden", className)}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
          <div>
            {title && <h3 className="text-sm font-semibold tracking-tight">{title}</h3>}
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function Stat({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: "default" | "mint" | "rose" | "violet";
}) {
  const tones: Record<string, string> = {
    default: "text-foreground",
    mint: "text-mint",
    rose: "text-rose",
    violet: "text-violet",
  };
  return (
    <div className="surface surface-hover p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="label-xs">{label}</p>
        {icon && <span className="text-muted-foreground/70">{icon}</span>}
      </div>
      <p className={cn("num mt-3 text-[22px] font-semibold leading-none sm:text-2xl", tones[tone])}>
        {value}
      </p>
      {hint && <div className="mt-2 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

/* ----------------------------------------------------------------- primitives */

type ButtonVariant = "primary" | "outline" | "ghost" | "danger" | "soft";
type ButtonSize = "sm" | "md" | "lg";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-mint text-[#04110d] hover:brightness-110 shadow-[0_12px_30px_-16px_rgba(52,224,176,0.9)]",
  outline: "border border-white/12 bg-white/[0.02] text-foreground hover:border-white/25 hover:bg-white/[0.05]",
  ghost: "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground",
  danger: "bg-rose/15 text-rose border border-rose/25 hover:bg-rose/25",
  soft: "bg-white/[0.06] text-foreground hover:bg-white/[0.1]",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs rounded-lg",
  md: "h-10 px-4 text-sm rounded-xl",
  lg: "h-11 px-5 text-sm rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  loading,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 font-semibold transition-all duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50",
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        className,
      )}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-[11px] text-rose">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-muted-foreground/80">{hint}</p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-mint/50 focus:bg-black/40 focus:outline-none disabled:opacity-50";

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: "neutral" | "mint" | "violet" | "rose" | "amber" | "outline";
  children: ReactNode;
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-white/[0.06] text-muted-foreground border-white/10",
    mint: "bg-mint/12 text-mint border-mint/25",
    violet: "bg-violet/12 text-violet border-violet/25",
    rose: "bg-rose/12 text-rose border-rose/25",
    amber: "bg-amber/12 text-amber border-amber/25",
    outline: "bg-transparent text-muted-foreground border-white/12",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const tone =
    severity === "critical"
      ? "rose"
      : severity === "high"
        ? "amber"
        : severity === "medium"
          ? "violet"
          : "neutral";
  return (
    <Badge tone={tone as "rose" | "amber" | "violet" | "neutral"}>
      {severity.toUpperCase()}
    </Badge>
  );
}

export function EmptyState({ title, description, icon }: { title: string; description?: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 px-6 py-12 text-center">
      {icon && <div className="text-muted-foreground/60">{icon}</div>}
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="max-w-sm text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-white/[0.06]", className)} />;
}

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* clipboard can be blocked — still show feedback */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-mint/40 hover:text-foreground"
      type="button"
    >
      {copied ? <Check className="h-3 w-3 text-mint" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : label}
    </button>
  );
}

export function Tone({ tone, children }: { tone: "mint" | "rose" | "violet" | "amber"; children: ReactNode }) {
  const map = { mint: "text-mint", rose: "text-rose", violet: "text-violet", amber: "text-amber" };
  return <span className={map[tone]}>{children}</span>;
}
