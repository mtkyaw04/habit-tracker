import { createFileRoute } from "@tanstack/react-router";
import { Flame, Target, TrendingUp, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { HabitCard } from "@/components/habit-card";
import { useHabits, isDueToday, todayKey, overallCurrentStreak } from "@/lib/habits-store";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { HabitFormModal, type HabitFormValue } from "@/components/habit-form-modal";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const { habits, profile, toggleComplete, deleteHabit, updateHabit } = useHabits();
  const [editing, setEditing] = useState<null | (typeof habits)[number]>(null);

  const todays = useMemo(() => habits.filter((h) => isDueToday(h)), [habits]);
  const key = todayKey();
  const completed = todays.filter((h) => h.completions.includes(key)).length;
  const total = todays.length;
  const rate = total ? Math.round((completed / total) * 100) : 0;
  const streak = overallCurrentStreak(habits);

  return (
    <AppShell>
      <section className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
          {greeting()}, {profile.username} <span className="inline-block">👋</span>
        </h1>
        <p className="mt-2 text-muted-foreground">Small steps today become tomorrow's bloom.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Today's progress"
          value={`${completed} / ${total}`}
          hint={total === 0 ? "Add your first habit" : `${rate}% complete`}
          color="bg-pink/60"
          icon={<Target className="h-5 w-5" />}
        />
        <StatCard
          label="Current streak"
          value={`${streak} day${streak === 1 ? "" : "s"}`}
          hint="Keep the glow going"
          color="bg-lavender/60"
          icon={<Flame className="h-5 w-5" />}
        />
        <StatCard
          label="Completion rate"
          value={`${rate}%`}
          hint="Today's rhythm"
          color="bg-sage/60"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Today's habits</h2>
            <p className="text-sm text-muted-foreground">Tap the check to mark one done.</p>
          </div>
          <Sparkles className="h-5 w-5 text-muted-foreground" />
        </div>

        {todays.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {todays.map((h) => (
              <HabitCard
                key={h.id}
                habit={h}
                onToggle={() => {
                  toggleComplete(h.id);
                  const nowDone = !h.completions.includes(key);
                  toast.success(nowDone ? `Nice work — ${h.name} ✨` : `Unmarked ${h.name}`);
                }}
                onEdit={() => setEditing(h)}
                onDelete={() => {
                  deleteHabit(h.id);
                  toast(`Removed ${h.name}`);
                }}
              />
            ))}
          </div>
        )}
      </section>

      <HabitFormModal
        open={!!editing}
        onOpenChange={(v) => !v && setEditing(null)}
        initial={editing}
        onSubmit={(v: HabitFormValue) => {
          if (editing) updateHabit(editing.id, v);
          setEditing(null);
        }}
      />
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  hint,
  color,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={`rounded-3xl ${color} p-5 shadow-soft`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-foreground/70">{label}</span>
        <span className="grid h-9 w-9 place-items-center rounded-2xl bg-white/70">{icon}</span>
      </div>
      <div className="mt-3 font-display text-3xl font-bold">{value}</div>
      <div className="mt-1 text-sm text-foreground/70">{hint}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/60 p-10 text-center shadow-soft">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/40">
        <Sparkles className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">No habits for today</h3>
      <p className="mt-1 text-sm text-muted-foreground">Head to the Habits page to plant your first ritual.</p>
    </div>
  );
}
