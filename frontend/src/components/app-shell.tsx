import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Home, ListChecks, Calendar, BarChart3, User, Sparkles, LogOut } from "lucide-react";
import { type ReactNode, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useHabits } from "@/lib/habits-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const NAV = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/habits", label: "Habits", icon: ListChecks },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/stats", label: "Statistics", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { profile, isAuthenticated, isLoading, authReady, logout } = useHabits(); // Destructure isLoading
  const navigate = useNavigate();

  useEffect(() => {
    if (!authReady) return;

    if (!isAuthenticated) {
      navigate({ to: "/login", replace: true });
    }
  }, [authReady, isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    toast("Logged out");
    navigate({ to: "/login" });
  };

  if (isLoading || !authReady || !isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <img src="/bloomLogo.png" alt="Bloom" className="h-20 w-20 animate-pulse" />
        <h1 className="mt-4 font-display text-3xl font-bold">Bloom</h1>
        <p className="mt-2 text-muted-foreground">Growing your garden...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-border/60 bg-sidebar/80 backdrop-blur-md px-5 py-6 md:flex">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <img src="/bloomLogo.png" alt="Bloom logo" className="h-10 w-10 object-contain" />

          <div>
            <div className="font-display text-lg font-bold leading-none">Bloom</div>
            <div className="text-xs text-muted-foreground">habit tracker</div>
          </div>
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all",
                  active
                    ? "bg-primary/25 text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Logout Button */}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="mt-4 flex items-center gap-3 rounded-2xl border border-destructive px-4 py-3 text-sm font-semibold text-destructive transition-all hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>

        {/* Profile Card */}
        <div className="mt-4 rounded-2xl bg-accent/50 p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-card text-xl shadow-soft">
              {profile.avatar}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{profile.username}</div>
              <div className="truncate text-xs text-muted-foreground">{profile.email}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="md:pl-64">
        {/* Top navbar (mobile) */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border/60 bg-background/70 px-5 py-4 backdrop-blur-md md:hidden">
          <Link to="/" className="flex items-center gap-2">
            <img src={"/bloomLogo.png"} alt="Bloom logo" className="h-10 w-10 object-contain" />
            <span className="font-display text-lg font-bold">Bloom</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-9 w-9 shrink-0 rounded-full text-destructive hover:bg-destructive/10"
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
            <Link
              to="/profile"
              className="grid h-9 w-9 place-items-center rounded-full bg-accent/60 text-lg"
            >
              {profile.avatar}
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-5 pb-28 pt-6 md:px-8 md:pb-10 md:pt-10">
          {children}
        </main>
      </div>

      {/* Bottom navigation (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border/60 bg-background/85 backdrop-blur-md md:hidden">
        <ul className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
          {NAV.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-semibold transition-colors",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-9 w-9 place-items-center rounded-2xl transition-all",
                      active ? "bg-primary/40 shadow-soft" : "bg-transparent",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
