import { useState, useRef } from "react";
import { Link } from "wouter";
import {
  useAdminGetUsers,
  useAdminResetPassword,
  useAdminGetStats,
  useAdminGetAuditLogs,
  useAdminCreateAuditLog,
  useAdminGetTransactions,
  useWebhookNotify,
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle, ShieldAlert, Key, Loader2, UserCog, Users, Activity,
  DollarSign, TrendingUp, AlertCircle, Globe, Terminal, RefreshCw,
  ArrowUpRight, ArrowDownRight, Send, Bug, Zap, Lock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getAdminGetAuditLogsQueryKey, getAdminGetUsersQueryKey, getAdminGetStatsQueryKey } from "@workspace/api-client-react";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function formatDate(d: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(d));
}

function StatCard({ title, value, sub, icon: Icon, color = "primary" }: any) {
  const colors: Record<string, string> = {
    primary: "text-primary bg-primary/10",
    green: "text-emerald-500 bg-emerald-500/10",
    red: "text-destructive bg-destructive/10",
    yellow: "text-yellow-500 bg-yellow-500/10",
  };
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="mt-1.5 text-2xl font-bold">{value}</p>
            {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div className={`p-2.5 rounded-lg ${colors[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Admin() {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading: loadingUsers } = useAdminGetUsers();
  const { data: stats, isLoading: loadingStats } = useAdminGetStats();
  const { data: auditLogs, isLoading: loadingLogs } = useAdminGetAuditLogs();
  const { data: allTxns, isLoading: loadingTxns } = useAdminGetTransactions({ limit: 30 });
  const resetPassword = useAdminResetPassword();
  const createLog = useAdminCreateAuditLog();
  const webhookNotify = useWebhookNotify();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Audit log form
  const [logAction, setLogAction] = useState("");
  const [logDetails, setLogDetails] = useState("");

  // Webhook SSRF form
  const [webhookUrl, setWebhookUrl] = useState("https://webhook.site/test");
  const [webhookEvent, setWebhookEvent] = useState("payment.completed");
  const [webhookResult, setWebhookResult] = useState<string | null>(null);

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return;
    try {
      await resetPassword.mutateAsync({ userId: selectedUser, data: { newPassword } });
      toast({ title: "Password Reset Successful", description: `Password changed for user ID ${selectedUser}.` });
      qc.invalidateQueries({ queryKey: getAdminGetUsersQueryKey() });
      setIsDialogOpen(false);
      setNewPassword("");
    } catch (err: any) {
      toast({ title: "Reset Failed", description: err?.data?.error || err.message, variant: "destructive" });
    }
  };

  const handleCreateLog = async () => {
    if (!logAction || !logDetails) return;
    try {
      await createLog.mutateAsync({ data: { action: logAction, details: logDetails } });
      toast({ title: "Log Entry Created", description: "Entry saved (XSS payload stored if injected)." });
      qc.invalidateQueries({ queryKey: getAdminGetAuditLogsQueryKey() });
      setLogAction("");
      setLogDetails("");
    } catch (err: any) {
      toast({ title: "Failed", description: err?.data?.error || err.message, variant: "destructive" });
    }
  };

  const handleWebhook = async () => {
    try {
      const result = await webhookNotify.mutateAsync({ data: { url: webhookUrl, event: webhookEvent } });
      setWebhookResult(JSON.stringify(result, null, 2));
      toast({ title: result.success ? "Webhook Delivered" : "Webhook Failed", description: result.message });
    } catch (err: any) {
      setWebhookResult(err?.data?.error || err.message);
      toast({ title: "Error", description: err?.data?.error || err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-destructive" />
            System Administration
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Logged in as <span className="font-mono text-foreground">{currentUser?.username}</span>
            {" "}<Badge variant={currentUser?.role === "admin" ? "destructive" : "secondary"} className="text-xs">{currentUser?.role}</Badge>
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => {
          qc.invalidateQueries({ queryKey: getAdminGetStatsQueryKey() });
          qc.invalidateQueries({ queryKey: getAdminGetUsersQueryKey() });
          qc.invalidateQueries({ queryKey: getAdminGetAuditLogsQueryKey() });
        }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Alert className="bg-destructive/10 border-destructive/30">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <AlertTitle className="text-destructive">Intentionally Vulnerable</AlertTitle>
        <AlertDescription className="text-sm">
          This admin panel is accessible without role verification (Broken Access Control / CWE-284).
          Any authenticated user can reach this page.
        </AlertDescription>
      </Alert>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loadingStats ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />) : <>
          <StatCard title="Total Users" value={stats?.totalUsers ?? 0} sub={`+${stats?.newUsersToday ?? 0} today`} icon={Users} color="primary" />
          <StatCard title="Total Accounts" value={stats?.totalAccounts ?? 0} icon={Lock} color="primary" />
          <StatCard title="Total Transactions" value={stats?.totalTransactions ?? 0} icon={Activity} color="green" />
          <StatCard title="Total Volume" value={formatCurrency(stats?.totalVolume ?? 0)} sub={`${formatCurrency(stats?.volumeToday ?? 0)} today`} icon={DollarSign} color="green" />
          <StatCard title="Active Users" value={stats?.activeUsers ?? 0} icon={TrendingUp} color="primary" />
          <StatCard title="Flagged Transactions" value={stats?.flaggedTransactions ?? 0} sub="amount > $5,000" icon={AlertCircle} color="red" />
          <StatCard title="New Users Today" value={stats?.newUsersToday ?? 0} icon={Users} color="yellow" />
          <StatCard title="Volume Today" value={formatCurrency(stats?.volumeToday ?? 0)} icon={DollarSign} color="yellow" />
        </>}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="users"><Users className="h-4 w-4 mr-1.5" />Users</TabsTrigger>
          <TabsTrigger value="transactions"><Activity className="h-4 w-4 mr-1.5" />Transactions</TabsTrigger>
          <TabsTrigger value="audit"><Terminal className="h-4 w-4 mr-1.5" />Audit Log</TabsTrigger>
          <TabsTrigger value="vulnerabilities"><Bug className="h-4 w-4 mr-1.5" />CVEs</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>User Directory</CardTitle>
              <CardDescription>All registered users. Click the key icon to force-reset any password (Broken Access Control).</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider">
                      <th className="px-4 py-3 text-left font-medium">ID</th>
                      <th className="px-4 py-3 text-left font-medium">User</th>
                      <th className="px-4 py-3 text-left font-medium">Email</th>
                      <th className="px-4 py-3 text-left font-medium">Role</th>
                      <th className="px-4 py-3 text-left font-medium">Joined</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loadingUsers ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i}><td colSpan={6} className="px-4 py-3"><Skeleton className="h-6 w-full" /></td></tr>
                      ))
                    ) : users?.map((u: any) => (
                      <tr key={u.id} className="hover:bg-muted/30 transition-colors" data-testid={`row-user-${u.id}`}>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{u.id}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                              {u.fullName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">{u.fullName}</div>
                              <div className="text-xs text-muted-foreground font-mono">@{u.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                        <td className="px-4 py-3">
                          <Badge variant={u.role === "admin" ? "destructive" : "secondary"} className="text-xs uppercase">
                            {u.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(u.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" asChild title="Edit profile (IDOR)">
                              <Link href={`/profile/${u.id}`}><UserCog className="h-4 w-4" /></Link>
                            </Button>
                            <Button
                              variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                              title="Force password reset (Broken Access Control)"
                              onClick={() => { setSelectedUser(u.id); setNewPassword(""); setIsDialogOpen(true); }}
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All System Transactions</CardTitle>
              <CardDescription>System-wide view of all transactions across all users and accounts.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs uppercase tracking-wider">
                      <th className="px-4 py-3 text-left font-medium">ID</th>
                      <th className="px-4 py-3 text-left font-medium">User</th>
                      <th className="px-4 py-3 text-left font-medium">Type</th>
                      <th className="px-4 py-3 text-left font-medium">Description</th>
                      <th className="px-4 py-3 text-left font-medium">Amount</th>
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loadingTxns ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}><td colSpan={6} className="px-4 py-3"><Skeleton className="h-6 w-full" /></td></tr>
                      ))
                    ) : allTxns?.map((t: any) => (
                      <tr key={t.id} className="hover:bg-muted/30 transition-colors" data-testid={`row-txn-${t.id}`}>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.id}</td>
                        <td className="px-4 py-3 font-mono text-xs">@{t.username}</td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1 text-xs font-medium ${t.type === "credit" ? "text-emerald-500" : "text-destructive"}`}>
                            {t.type === "credit" ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                            {t.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{t.description}</td>
                        <td className={`px-4 py-3 font-semibold ${t.type === "credit" ? "text-emerald-500" : ""}`}>
                          {t.type === "credit" ? "+" : "-"}{formatCurrency(t.amount)}
                          {t.amount > 5000 && <span className="ml-1.5 text-xs text-yellow-500 font-normal">(flagged)</span>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(t.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Stored XSS — Audit Log
              </CardTitle>
              <CardDescription>
                Log entries are rendered as raw HTML (dangerouslySetInnerHTML). 
                Try: <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">&lt;img src=x onerror=alert('XSS')&gt;</code>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Action</Label>
                  <Input
                    value={logAction}
                    onChange={e => setLogAction(e.target.value)}
                    placeholder="USER_LOGIN, CONFIG_CHANGE..."
                    className="bg-black/20 font-mono text-sm"
                    data-testid="input-log-action"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Details (rendered as HTML — XSS here)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={logDetails}
                      onChange={e => setLogDetails(e.target.value)}
                      placeholder="<img src=x onerror=alert('XSS')>"
                      className="bg-black/20 font-mono text-sm"
                      data-testid="input-log-details"
                    />
                    <Button size="sm" onClick={handleCreateLog} disabled={!logAction || !logDetails || createLog.isPending}>
                      {createLog.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-muted/40 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <div className="col-span-1">ID</div>
                  <div className="col-span-2">Action</div>
                  <div className="col-span-6">Details (raw HTML rendered)</div>
                  <div className="col-span-2">User</div>
                  <div className="col-span-1">Time</div>
                </div>
                <div className="divide-y divide-border">
                  {loadingLogs ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="px-4 py-3"><Skeleton className="h-5 w-full" /></div>
                    ))
                  ) : auditLogs?.length === 0 ? (
                    <div className="px-4 py-8 text-center text-muted-foreground text-sm">No audit logs yet. Create one above.</div>
                  ) : auditLogs?.map((log: any) => (
                    <div key={log.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-start hover:bg-muted/30 text-sm">
                      <div className="col-span-1 font-mono text-xs text-muted-foreground">{log.id}</div>
                      <div className="col-span-2 font-mono text-xs font-medium truncate">{log.action}</div>
                      {/* CVE: Stored XSS - rendering user input as raw HTML */}
                      <div
                        className="col-span-6 text-sm"
                        dangerouslySetInnerHTML={{ __html: log.details }}
                      />
                      <div className="col-span-2 text-xs text-muted-foreground font-mono">uid:{log.userId ?? "?"}</div>
                      <div className="col-span-1 text-xs text-muted-foreground">{formatDate(log.createdAt)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CVE Reference Tab */}
        <TabsContent value="vulnerabilities" className="mt-4">
          <div className="grid gap-4">
            {/* SSRF Tester */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-yellow-500" />
                  SSRF — Server-Side Request Forgery (CWE-918)
                </CardTitle>
                <CardDescription>
                  The server fetches whatever URL you provide. Try internal endpoints:
                  <code className="text-xs bg-muted px-1 py-0.5 rounded ml-1 font-mono">http://localhost:8080/api/healthz</code>
                  {" "}or cloud metadata:
                  <code className="text-xs bg-muted px-1 py-0.5 rounded ml-1 font-mono">http://169.254.169.254/latest/meta-data/</code>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Target URL (any URL the server will fetch)</Label>
                    <Input
                      value={webhookUrl}
                      onChange={e => setWebhookUrl(e.target.value)}
                      className="bg-black/20 font-mono text-sm"
                      data-testid="input-webhook-url"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Event Name</Label>
                    <div className="flex gap-2">
                      <Input
                        value={webhookEvent}
                        onChange={e => setWebhookEvent(e.target.value)}
                        className="bg-black/20 font-mono text-sm"
                        data-testid="input-webhook-event"
                      />
                      <Button onClick={handleWebhook} disabled={webhookNotify.isPending}>
                        {webhookNotify.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
                {webhookResult && (
                  <pre className="mt-3 text-xs bg-black/40 rounded-lg p-4 overflow-auto max-h-48 font-mono border border-border">
                    {webhookResult}
                  </pre>
                )}
              </CardContent>
            </Card>

            {/* CVE Reference Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  id: "CVE-2024-SQL", title: "SQL Injection (CWE-89)", color: "destructive",
                  desc: "Transactions search is vulnerable.",
                  poc: "GET /api/transactions?search=' OR '1'='1",
                  notes: "Try: ' UNION SELECT username,password_hash,3,4,5,6,7 FROM users--"
                },
                {
                  id: "CVE-2024-IDOR", title: "IDOR (CWE-639)", color: "yellow",
                  desc: "Any user's data accessible by ID.",
                  poc: "GET /api/users/2  (logged in as user 1)",
                  notes: "Also: GET /api/accounts/4 (account owned by user 2)"
                },
                {
                  id: "CVE-2024-BAC", title: "Broken Access Control (CWE-284)", color: "destructive",
                  desc: "Admin panel has no role check.",
                  poc: "GET /admin  (logged in as regular user)",
                  notes: "Also: POST /api/admin/users/1/reset-password works for any authenticated user"
                },
                {
                  id: "CVE-2024-JWT", title: "JWT Algorithm Confusion (CVE-2015-9235)", color: "yellow",
                  desc: 'Server accepts alg:"none" — unsigned tokens.',
                  poc: 'Header: {"alg":"none","typ":"JWT"}\nPayload: {"userId":3,"username":"admin","role":"admin"}',
                  notes: "Forge a token: base64url(header).base64url(payload). (no signature needed)"
                },
                {
                  id: "CVE-2024-MASS", title: "Mass Assignment (CWE-915)", color: "yellow",
                  desc: "User update allows setting role field.",
                  poc: 'PUT /api/users/1\n{"role":"admin"}',
                  notes: "Escalate any user to admin without authentication"
                },
                {
                  id: "CVE-2024-XSS", title: "Stored XSS (CWE-79)", color: "destructive",
                  desc: "Audit log details rendered as raw HTML.",
                  poc: 'POST /api/admin/audit-logs\n{"action":"X","details":"<script>alert(1)</script>"}',
                  notes: "Stored payload executes for every admin who views the audit log"
                },
                {
                  id: "CVE-2024-HASH", title: "Weak Password Hashing (CWE-916)", color: "yellow",
                  desc: "SHA-256 without salt. Lookup tables work.",
                  poc: "SELECT password_hash FROM users WHERE id=1",
                  notes: "Crack with: hashcat -m 1400 hash.txt rockyou.txt"
                },
                {
                  id: "CVE-2024-SSRF", title: "SSRF (CWE-918)", color: "destructive",
                  desc: "Webhook endpoint fetches arbitrary URLs.",
                  poc: 'POST /api/webhook/notify\n{"url":"http://169.254.169.254/latest/meta-data/","event":"x"}',
                  notes: "Use the SSRF tester above to reach internal services"
                },
              ].map(cve => (
                <Card key={cve.id} className="border-border">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm">{cve.title}</h3>
                      <Badge
                        variant={cve.color === "destructive" ? "destructive" : "outline"}
                        className={`text-xs shrink-0 ${cve.color === "yellow" ? "border-yellow-500/50 text-yellow-500" : ""}`}
                      >
                        {cve.color === "destructive" ? "Critical" : "High"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{cve.desc}</p>
                    <pre className="text-xs bg-black/40 rounded p-2.5 font-mono overflow-x-auto border border-border/50">{cve.poc}</pre>
                    <p className="text-xs text-muted-foreground italic">{cve.notes}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Reset Password Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Key className="h-5 w-5" />
              Force Password Reset
            </DialogTitle>
            <DialogDescription>
              Forcibly reset password for user ID {selectedUser} — no current password required. (Broken Access Control)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>New Password</Label>
            <Input
              type="text"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="bg-black/20 font-mono"
              placeholder="Enter new password"
              data-testid="input-new-password"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleResetPassword} disabled={!newPassword || resetPassword.isPending}>
              {resetPassword.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
