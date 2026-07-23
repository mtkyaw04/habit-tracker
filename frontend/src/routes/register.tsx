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

function isValidEmail(email: string): boolean {
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setAuth } = useHabits();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    setUsernameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmError(null);

    let hasError = false;

    if (!username) {
      setUsernameError("Username is required");
      hasError = true;
    }

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

    if (!confirm) {
      setConfirmError("Confirm password is required");
      hasError = true;
    } else if (password !== confirm) {
      setConfirmError("Passwords don't match");
      hasError = true;
    }

    if (hasError) {
      return;
    }

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
            onChange={(e) => {
              setUsername(e.target.value);
              setUsernameError(null); // Clear error on change
            }}
            placeholder="Sarah"
            className="rounded-2xl"
          />
          {usernameError && <p className="text-sm text-red-500">{usernameError}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="e">Email</Label>
          <Input
            id="e"
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
          <Label htmlFor="p">Password</Label>
          <Input
            id="p"
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
        <div className="grid gap-2">
          <Label htmlFor="c">Confirm password</Label>
          <Input
            id="c"
            type="password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              setConfirmError(null); // Clear error on change
            }}
            placeholder="••••••••"
            className="rounded-2xl"
          />
          {confirmError && <p className="text-sm text-red-500">{confirmError}</p>}
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