import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { AuthShell } from "./login";
import { useHabits } from "@/lib/habits-store";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — Bloom" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();
  const { setAuth } = useHabits();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) return toast.error("Please fill in all fields");
    if (password !== confirm) return toast.error("Passwords don't match");
    try {
      const { token, profile } = await api.register(username, email, password);
      setAuth(token, profile);
      toast.success(`Welcome, ${username} 🌸`);
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create account");
    }
  };

  return (
    <AuthShell
      title="Start blooming"
      subtitle="Create your account to grow gentle habits."
      footer={
        <>
          Already have one?{" "}
          <Link
            to="/login"
            className="font-semibold text-primary-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="u">Username</Label>
          <Input
            id="u"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Sarah"
            className="rounded-2xl"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="e">Email</Label>
          <Input
            id="e"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="rounded-2xl"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="p">Password</Label>
          <Input
            id="p"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="rounded-2xl"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="c">Confirm password</Label>
          <Input
            id="c"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            className="rounded-2xl"
          />
        </div>
        <Button
          type="submit"
          className="mt-2 rounded-2xl bg-primary text-primary-foreground shadow-soft hover:bg-primary/90"
        >
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
