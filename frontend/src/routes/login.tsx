import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useHabits } from "@/lib/habits-store";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Bloom" }] }),
  component: LoginPage,
});

function isValidEmail(email: string): boolean {
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setAuth } = useHabits();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    setEmailError(null);
    setPasswordError(null);

    let hasError = false;

    if (!email) {
      setEmailError("Email is required");
      hasError = true;
    } else if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      hasError = true;
    }

    if (!password) {
      setPasswordError("Password is required");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      const { token, profile } = await api.login(email, password);
      setAuth(token, profile);
      toast.success("Welcome back 🌷");
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to sign in");
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to keep your streak alive."
      footer={
        <>
          New here?{" "}
          <Link
            to="/register"
            className="font-semibold text-primary-foreground underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError(null); // Clear error on change
            }}
            placeholder="you@example.com"
            className="rounded-2xl"
          />
          {emailError && <p className="text-sm text-red-500">{emailError}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError(null); // Clear error on change
            }}
            placeholder="••••••••"
            className="rounded-2xl"
          />
          {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
        </div>
        <Button
          type="submit"
          className="mt-2 rounded-2xl bg-primary text-primary-foreground shadow-soft hover:bg-primary/90"
        >
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen place-items-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="grid h-14 w-14 place-items-center rounded-3xl bg-primary/70 shadow-cozy">
            <img src="/bloomLogo.png" alt="Bloom" className="h-15 w-15" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="rounded-3xl bg-card p-6 shadow-cozy sm:p-8">{children}</div>
        <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
      </div>
    </div>
  );
}
