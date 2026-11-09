import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { toast } from "sonner";
import {
  BadgeCheck,
  Camera,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { api, ApiError, formatDate, initials } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import {
  Badge,
  Button,
  CopyButton,
  Field,
  inputClass,
  PageHeader,
  Panel,
  Skeleton,
} from "@/components/app-ui";
import type { User } from "@/lib/types";

export default function Profile() {
  const params = useParams<{ userId?: string }>();
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();

  const targetId = params.userId ? Number(params.userId) : user?.id ?? 0;
  const isSelf = targetId === user?.id;

  const [revealSecrets, setRevealSecrets] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", address: "" });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const profileQuery = useQuery({
    queryKey: ["user", targetId],
    queryFn: () => api<User>(`/api/users/${targetId}`),
    enabled: targetId > 0,
  });

  const profile = profileQuery.data;

  useEffect(() => {
    if (!profile) return;
    setForm({
      fullName: profile.fullName ?? "",
      email: profile.email ?? "",
      phone: profile.phone ?? "",
      address: profile.address ?? "",
    });
  }, [profile]);

  const save = useMutation({
    mutationFn: () => api<User>(`/api/users/${targetId}`, { method: "PUT", body: form }),
    onSuccess: (updated) => {
      toast.success("Profile updated");
      void queryClient.invalidateQueries({ queryKey: ["user", targetId] });
      if (isSelf) setUser({ ...(user as User), ...updated });
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Update failed"),
  });

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      return api<{ filename: string }>("/api/profile/avatar", {
        method: "POST",
        body: { filename: file.name, content },
      });
    },
    onSuccess: ({ filename }) => {
      setAvatarUrl(`/api/uploads/${encodeURIComponent(filename)}?t=${Date.now()}`);
      toast.success("Photo updated");
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Upload failed"),
  });

  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const memberSince = profile?.createdAt
    ? formatDate(profile.createdAt)
    : "—";

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={isSelf ? "Your account" : "Customer profile"}
        title={profile?.fullName || "Profile"}
        description="Contact details, account preferences and API access."
        actions={
          <Badge tone={profile?.role === "admin" ? "violet" : "mint"}>
            <BadgeCheck className="h-3 w-3" />
            {profile?.role ?? "customer"}
          </Badge>
        }
      />

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-4">
          <Panel bodyClassName="p-6">
            {profileQuery.isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile photo"
                      className="h-20 w-20 rounded-2xl object-cover"
                    />
                  ) : (
                    <span className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-violet/80 via-mint/70 to-emerald-500 text-2xl font-bold text-[#07110e]">
                      {initials(profile?.fullName)}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-2 -right-2 grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-[#0c1017] text-muted-foreground transition-colors hover:border-mint/40 hover:text-mint"
                    aria-label="Upload photo"
                  >
                    {upload.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Camera className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) upload.mutate(file);
                      event.target.value = "";
                    }}
                  />
                </div>

                <h3 className="mt-4 text-lg font-semibold tracking-tight">
                  {profile?.fullName || "—"}
                </h3>
                <p className="text-xs text-muted-foreground">@{profile?.username ?? "member"}</p>
                <p className="mt-1 text-[11px] text-muted-foreground/70">
                  Member since {memberSince}
                </p>

                <div className="mt-5 w-full space-y-2 text-left">
                  <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2">
                    <span className="text-[11px] text-muted-foreground">Customer id</span>
                    <span className="num text-xs">{profile?.id ?? "—"}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2">
                    <span className="text-[11px] text-muted-foreground">Email</span>
                    <span className="truncate text-xs">{profile?.email ?? "—"}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2">
                    <span className="text-[11px] text-muted-foreground">Phone</span>
                    <span className="text-xs">{profile?.phone || "—"}</span>
                  </div>
                </div>
              </div>
            )}
          </Panel>

          <Panel title="Security" description="Session and access settings for this profile.">
            <div className="space-y-2 text-[11px] text-muted-foreground">
              <p className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-mint" />
                Session active on this device
              </p>
              <p className="flex items-center gap-2">
                <Fingerprint className="h-3.5 w-3.5 text-mint" />
                Two-factor authentication available
              </p>
            </div>
          </Panel>
        </div>

        <div className="space-y-4 lg:col-span-8">
          <Panel title="Personal details" description="Update your contact information.">
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                save.mutate();
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" htmlFor="profile-name">
                  <input id="profile-name" className={inputClass} value={form.fullName} onChange={update("fullName")} />
                </Field>
                <Field label="Email" htmlFor="profile-email">
                  <input id="profile-email" type="email" className={inputClass} value={form.email} onChange={update("email")} />
                </Field>
                <Field label="Phone" htmlFor="profile-phone">
                  <input id="profile-phone" className={inputClass} value={form.phone} onChange={update("phone")} />
                </Field>
                <Field label="Address" htmlFor="profile-address">
                  <input id="profile-address" className={inputClass} value={form.address} onChange={update("address")} />
                </Field>
              </div>

              <Button type="submit" loading={save.isPending}>
                Save changes
              </Button>
            </form>
          </Panel>

          <Panel
            title="Account identifiers"
            description="Tax and API credentials attached to this profile."
            action={
              <Button size="sm" variant="ghost" onClick={() => setRevealSecrets((v) => !v)}>
                {revealSecrets ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {revealSecrets ? "Hide" : "Reveal"}
              </Button>
            }
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <SecretRow
                icon={<Fingerprint className="h-3.5 w-3.5" />}
                label="SSN"
                value={revealSecrets ? profile?.ssn ?? "—" : "•••-••-••••"}
              />
              <SecretRow
                icon={<KeyRound className="h-3.5 w-3.5" />}
                label="API key"
                value={revealSecrets ? profile?.apiKey ?? "—" : "vbk_live_••••••••••••"}
              />
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              API keys are long-lived. Rotate them from the dashboard when needed.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function SecretRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-black/25 p-3">
      <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {icon}
        {label}
      </p>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <span className="num truncate text-xs">{value}</span>
        <CopyButton value={value} label="" />
      </div>
    </div>
  );
}
