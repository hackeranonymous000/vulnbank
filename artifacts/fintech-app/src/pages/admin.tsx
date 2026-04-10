import { useState } from "react";
import { Link } from "wouter";
import { useAdminGetUsers, useAdminResetPassword } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, ShieldAlert, Key, Loader2, UserCog, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(dateStr));
}

export default function Admin() {
  const { data: users, isLoading } = useAdminGetUsers();
  const resetPassword = useAdminResetPassword();
  const { toast } = useToast();
  
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return;

    try {
      await resetPassword.mutateAsync({
        userId: selectedUser,
        data: { newPassword }
      });

      toast({
        title: "Password Reset Successful",
        description: `Successfully reset password for user ID ${selectedUser}.`,
      });
      
      setIsDialogOpen(false);
      setNewPassword("");
    } catch (err: any) {
      toast({
        title: "Reset Failed",
        description: err.message || "Could not reset password.",
        variant: "destructive",
      });
    }
  };

  const openResetDialog = (userId: number) => {
    setSelectedUser(userId);
    setNewPassword("");
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-destructive flex items-center gap-2">
            <ShieldAlert className="h-6 w-6" /> System Administration
          </h2>
          <p className="text-muted-foreground">Manage user access and system settings.</p>
        </div>
      </div>

      <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Privileged Access</AlertTitle>
        <AlertDescription>
          You are accessing the administration panel. All actions are logged. 
          (Note: This area is intentionally missing proper role-based access control).
        </AlertDescription>
      </Alert>

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
          <CardDescription>Complete list of all registered users in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 font-medium text-sm text-muted-foreground border-b border-border">
              <div className="col-span-1">ID</div>
              <div className="col-span-3">User</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2">Joined</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {users?.map((user: any) => (
                  <div key={user.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/30 transition-colors">
                    <div className="col-span-1 font-mono text-xs">{user.id}</div>
                    <div className="col-span-3 flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                        {user.fullName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="font-medium text-sm truncate">{user.fullName}</div>
                        <div className="text-xs text-muted-foreground truncate">@{user.username}</div>
                      </div>
                    </div>
                    <div className="col-span-3 text-sm truncate" title={user.email}>{user.email}</div>
                    <div className="col-span-2">
                      <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'} className="text-xs uppercase">
                        {user.role}
                      </Badge>
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </div>
                    <div className="col-span-1 flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" asChild title="Edit User (IDOR)">
                        <Link href={`/profile/${user.id}`}>
                          <UserCog className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive" 
                        onClick={() => openResetDialog(user.id)}
                        title="Force Password Reset"
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Force Password Reset
            </DialogTitle>
            <DialogDescription>
              This will immediately change the password for user ID {selectedUser} without requiring their current password.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-password" className="text-right">
                New Password
              </Label>
              <Input
                id="new-password"
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="col-span-3 bg-black/20 font-mono"
                placeholder="Enter new secure password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleResetPassword}
              disabled={!newPassword || resetPassword.isPending}
            >
              {resetPassword.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
