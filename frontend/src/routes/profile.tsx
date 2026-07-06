import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useHabits } from "@/lib/habits-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Bloom" }] }),
  component: ProfilePage,
});

const AVATARS = ["🌸", "🌷", "🌼", "🌻", "🌿", "🍃", "🪷", "☁️"];

function ProfilePage() {
  const { profile, updateProfile, logout } = useHabits();
  const [username, setUsername] = useState(profile.username);
  const [avatar, setAvatar] = useState(profile.avatar);
  const navigate = useNavigate();

  const save = () => {
    updateProfile({ username, avatar });
    toast.success("Profile saved");
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Profile</h1>
        <p className="mt-1 text-muted-foreground">Make it yours.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="rounded-3xl bg-card p-6 text-center shadow-soft">
          <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-primary/40 text-5xl shadow-cozy">
            {avatar}
          </div>
          <div className="mt-4 font-display text-xl font-bold">{username}</div>
          <div className="text-sm text-muted-foreground">{profile.email}</div>

          <div className="mt-6 grid grid-cols-4 gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                onClick={() => setAvatar(a)}
                className={`grid h-12 w-12 place-items-center rounded-2xl text-2xl transition-all ${
                  avatar === a ? "bg-primary/60 shadow-soft" : "bg-accent/50 hover:bg-accent"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-card p-6 shadow-soft">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="u">Username</Label>
              <Input
                id="u"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded-2xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="e">Email</Label>
              <Input
                id="e"
                type="email"
                value={profile.email}
                disabled
                className="rounded-2xl opacity-70"
              />
              <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <Button
                onClick={save}
                className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Save changes
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  logout();
                  toast("Logged out");
                  navigate({ to: "/login" });
                }}
                className="rounded-2xl text-destructive hover:bg-destructive/10"
              >
                <LogOut className="mr-1 h-4 w-4" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
