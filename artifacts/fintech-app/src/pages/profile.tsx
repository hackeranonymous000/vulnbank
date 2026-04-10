import { useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Mail, Phone, MapPin, Loader2, AlertTriangle, Key } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

import { useAuth } from "@/hooks/use-auth";
import { useGetUser, useGetMe, useUpdateUser, getGetUserQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const profileSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // If userId param exists, fetch that user (IDOR vulnerability)
  // Otherwise, fetch current user
  const isEditingOtherUser = !!userId && userId !== currentUser?.id.toString();
  const targetId = userId ? parseInt(userId, 10) : currentUser?.id || 0;
  
  const { data: profileUser, isLoading } = useGetUser(targetId, {
    query: { enabled: !!targetId }
  });

  const updateUser = useUpdateUser();

  const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  // Update form when user data loads
  useEffect(() => {
    if (profileUser) {
      reset({
        fullName: profileUser.fullName || "",
        email: profileUser.email || "",
        phone: (profileUser as any).phone || "",
        address: (profileUser as any).address || "",
      });
    }
  }, [profileUser, reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await updateUser.mutateAsync({ 
        userId: targetId, 
        data 
      });
      
      toast({
        title: "Profile updated",
        description: "User information saved successfully.",
      });

      queryClient.invalidateQueries({ queryKey: getGetUserQueryKey(targetId) });
      
      // If we edited ourselves, we might want to update the me query too
      if (!isEditingOtherUser) {
        // Just invalidate, layout component will refetch if needed
      }
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err.message || "An error occurred while updating the profile.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">User Profile</h2>
        <p className="text-muted-foreground">Manage personal information and settings.</p>
      </div>

      {isEditingOtherUser && (
        <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Access Warning</AlertTitle>
          <AlertDescription>
            You are viewing profile ID {userId}. This might not be your account.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            {isLoading ? (
              <Skeleton className="h-24 w-24 rounded-full mb-4" />
            ) : (
              <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4 border-2 border-primary/50">
                <User className="h-10 w-10" />
              </div>
            )}
            
            {isLoading ? (
              <div className="space-y-2 w-full flex flex-col items-center">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-5 w-16 mt-2" />
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold">{profileUser?.fullName}</h3>
                <p className="text-sm text-muted-foreground font-mono">@{profileUser?.username}</p>
                <div className="mt-4 flex gap-2">
                  <Badge variant={profileUser?.role === 'admin' ? 'destructive' : 'default'} className="uppercase">
                    {profileUser?.role}
                  </Badge>
                  <Badge variant="outline" className="font-mono">ID: {profileUser?.id}</Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your contact details here.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        className="pl-9 bg-black/20"
                        {...register("fullName")}
                      />
                    </div>
                    {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-9 bg-black/20"
                        {...register("email")}
                      />
                    </div>
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder="+1 (555) 000-0000"
                        className="pl-9 bg-black/20"
                        {...register("phone")}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Mailing Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="address"
                        placeholder="123 Bank St, Financial District"
                        className="pl-9 bg-black/20"
                        {...register("address")}
                      />
                    </div>
                  </div>
                </div>
              </form>
            )}
          </CardContent>
          <CardFooter className="bg-muted/50 py-4 border-t border-border flex justify-end">
            <Button 
              type="submit" 
              form="profile-form"
              disabled={isLoading || updateUser.isPending || (!isDirty && !isEditingOtherUser)}
            >
              {updateUser.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </CardFooter>
        </Card>

        {/* Password section placeholder (not functional but looks real) */}
        <Card className="md:col-span-3 mt-6">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Key className="h-5 w-5" /> Security
            </CardTitle>
            <CardDescription>Update your password and security settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 opacity-50 pointer-events-none">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" value="********" readOnly className="bg-black/20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" value="********" readOnly className="bg-black/20" />
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input type="password" value="********" readOnly className="bg-black/20" />
              </div>
            </div>
            <Button variant="destructive" disabled>Update Password</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
