import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { AppShell } from "@/components/app-shell";
import {
  useHabits,
  dateKey,
  overallCurrentStreak,
  overallLongestStreak,
  isDueToday,
  type Habit,
} from "@/lib/habits-store";
import { Flame, Trophy, Percent, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/stats")({
  head: () => ({ meta: [{ title: "Statistics — Bloom" }] }),
  component: StatsPage,
});

function StatsPage() {
  const { habits } = useHabits();

  const weekly = useMemo(() => {
    const days: { label: string; completed: number; total: number }[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = dateKey(d);
      const due = habits.filter((h) => isDueToday(h, d)).length;
      const done = habits.filter((h) => h.completions.includes(iso)).length;
      days.push({
        label: d.toLocaleDateString(undefined, { weekday: "short" }),
        completed: done,
        total: due,
      });
    }
    return days;
  }, [habits]);

  const totalDue = weekly.reduce((s, d) => s + d.total, 0);
  const totalDone = weekly.reduce((s, d) => s + d.completed, 0);
  const rate = totalDue ? Math.round((totalDone / totalDue) * 100) : 0;

  const streak = overallCurrentStreak(habits);
  const longest = overallLongestStreak(habits);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Statistics</h1>
        <p className="mt-1 text-muted-foreground">Your progress, gently visualized.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat
          label="Completion rate"
          value={`${rate}%`}
          color="bg-pink/60"
          icon={<Percent className="h-4 w-4" />}
        />
        <MiniStat
          label="Current streak"
          value={`${streak}d`}
          color="bg-lavender/60"
          icon={<Flame className="h-4 w-4" />}
        />
        <MiniStat
          label="Longest streak"
          value={`${longest}d`}
          color="bg-sage/60"
          icon={<Trophy className="h-4 w-4" />}
        />
        <MiniStat
          label="Active habits"
          value={String(habits.length)}
          color="bg-sky/60"
          icon={<Target className="h-4 w-4" />}
        />
      </section>

      <section className="mt-8 rounded-3xl bg-card p-5 shadow-soft">
        <h2 className="mb-4 font-display text-xl font-bold">This week</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekly} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="var(--color-muted-foreground)"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--color-muted-foreground)"
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "16px",
                }}
              />
              <Bar dataKey="completed" fill="var(--color-primary)" radius={[12, 12, 4, 4]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mt-6 rounded-3xl bg-card p-5 shadow-soft">
        <h2 className="mb-4 font-display text-xl font-bold">Activity</h2>
        <ActivityHeatmap habits={habits} />
      </section>
    </AppShell>
  );
}

function MiniStat({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={`rounded-3xl ${color} p-5 shadow-soft`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-foreground/70">
          {label}
        </span>
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/70">{icon}</span>
      </div>
      <div className="mt-2 font-display text-3xl font-bold">{value}</div>
    </div>
  );
}

/* ---------- GitHub-style activity heatmap ---------- */

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function ActivityHeatmap({ habits }: { habits: Habit[] }) {
  const cursor = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }, []);

  const days = useMemo(() => buildMonthCells(cursor), [cursor]);

  const completedByDay = useMemo(() => {
    const map = new Map<string, number>();
    habits.forEach((h) => {
      h.completions.forEach((iso) => {
        map.set(iso, (map.get(iso) ?? 0) + 1);
      });
    });
    return map;
  }, [habits]);

  const monthLabel = cursor.toLocaleDateString(undefined, { month: "long" });
  const yearLabel = cursor.getFullYear();
  const todayISO = dateKey(new Date());

  return (
    <div className="rounded-2xl bg-muted/60 p-4 sm:p-5">
      <div className="mb-3">
        <div className="font-display text-lg font-bold leading-tight">{monthLabel}</div>
        <div className="text-sm text-muted-foreground">{yearLabel}</div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold uppercase text-muted-foreground">
        {WEEKDAY_LABELS.map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>

      <div className="mt-1.5 grid grid-cols-7 gap-1.5">
        {days.map((d, i) => {
          if (!d) return <div key={i} className="aspect-square" />;
          const iso = dateKey(d);
          const inMonth = d.getMonth() === cursor.getMonth();
          const count = completedByDay.get(iso) ?? 0;
          const intensity = Math.min(count, 4);
          const isToday = iso === todayISO;
          return (
            <div
              key={iso}
              title={`${iso} — ${count} habit${count === 1 ? "" : "s"} completed`}
              className={cn(
                "aspect-square rounded-[4px] transition-colors",
                !inMonth && "opacity-30",
                isToday && "ring-2 ring-primary ring-offset-1 ring-offset-muted",
                intensity === 0 && "bg-border/70",
                intensity === 1 && "bg-sage/40",
                intensity === 2 && "bg-sage/65",
                intensity === 3 && "bg-sage",
                intensity >= 4 && "bg-sage shadow-soft",
              )}
            />
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
        <span>Less</span>
        <span className="h-3 w-3 rounded-[3px] bg-border/70" />
        <span className="h-3 w-3 rounded-[3px] bg-sage/40" />
        <span className="h-3 w-3 rounded-[3px] bg-sage/65" />
        <span className="h-3 w-3 rounded-[3px] bg-sage" />
        <span>More</span>
      </div>
    </div>
  );
}

function buildMonthCells(cursor: Date): (Date | null)[] {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  const cells: (Date | null)[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push(d);
  }
  return cells;
}
