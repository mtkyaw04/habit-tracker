import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import {
  useHabits,
  dateKey,
  overallCurrentStreak,
  overallLongestStreak,
  isDueToday,
} from "@/lib/habits-store";
import { Flame, Trophy, Percent, Target } from "lucide-react";

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

  const monthly = useMemo(() => {
    const days: { label: string; completed: number }[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = dateKey(d);
      const done = habits.filter((h) => h.completions.includes(iso)).length;
      days.push({ label: `${d.getMonth() + 1}/${d.getDate()}`, completed: done });
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
        {/* <MiniStat
          label="Completion rate"
          value={`${rate}%`}
          color="bg-pink/60"
          icon={<Percent className="h-4 w-4" />}
        />*/}

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
        <h2 className="mb-4 font-display text-xl font-bold">Last 30 days</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="var(--color-muted-foreground)"
                tickLine={false}
                axisLine={false}
                interval={4}
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
              <Line
                type="monotone"
                dataKey="completed"
                stroke="var(--color-secondary-foreground)"
                strokeWidth={3}
                dot={{ fill: "var(--color-primary)", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
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
