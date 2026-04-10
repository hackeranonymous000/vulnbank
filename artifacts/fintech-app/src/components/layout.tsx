import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  CreditCard,
  ArrowRightLeft,
  History,
  User,
  ShieldAlert,
  LogOut,
} from "lucide-react";
import { useLogout } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (e) {
      // Ignore API errors on logout
    }
    logout();
    toast({
      title: "Logged out",
      description: "You have been securely logged out.",
    });
    setLocation("/");
  };

  const navItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Accounts", href: "/accounts", icon: CreditCard },
    { title: "Transactions", href: "/transactions", icon: History },
    { title: "Transfer", href: "/transfer", icon: ArrowRightLeft },
    { title: "Profile", href: "/profile", icon: User },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-foreground">
        <Sidebar variant="inset" className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
          <SidebarHeader className="h-16 flex items-center justify-start px-6 border-b border-sidebar-border">
            <div className="flex items-center gap-2 font-mono font-bold text-xl tracking-tighter text-primary">
              <ShieldAlert className="h-6 w-6" />
              <span>VULNBANK</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={location.startsWith(item.href) && (item.href !== "/dashboard" || location === "/dashboard")}>
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  {user?.role === "admin" && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.startsWith("/admin")}>
                        <Link href="/admin">
                          <ShieldAlert className="h-4 w-4" />
                          <span>Admin Panel</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col truncate">
                <span className="text-sm font-medium truncate">{user?.fullName}</span>
                <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-sidebar-accent rounded-md transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 flex items-center gap-4 px-6 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 shrink-0">
            <SidebarTrigger />
            <h1 className="font-semibold capitalize">
              {location.split("/")[1] || "Dashboard"}
            </h1>
          </header>
          <div className="flex-1 overflow-auto p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
