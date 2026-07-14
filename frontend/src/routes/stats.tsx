import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import {
  useHabits,
  dateKey,
  overallCurrentStreak,
  overallLongestStreak,
  isDueToday,
  type Habit,
} from "@/lib/habits-store";
import { Flame, Trophy, Percent, Target, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [{ title: "Statistics — Bloom" }],
  }),
  component: StatsPage,
});

type WeeklyDay = {
  iso: string;
  label: string; // e.g. "Mon"
  shortLabel: string; // e.g. "M"
  dateLabel: string; // e.g. "Jan 14"
  completed: number;
  total: number;
};

function StatsPage() {
  const { habits } = useHabits();
  const isMobile = useIsMobile();

  const weekly = useMemo<WeeklyDay[]>(() => {
    const days: WeeklyDay[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = dateKey(d);
      const due = habits.filter((h) => isDueToday(h, d)).length;
      const done = habits.filter((h) => h.completions.includes(iso)).length;
      days.push({
        iso,
        label: d.toLocaleDateString(undefined, { weekday: "short" }),
        shortLabel: d.toLocaleDateString(undefined, { weekday: "narrow" }),
        dateLabel: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        completed: done,
        total: due,
      });
    }
    return days;
  }, [habits]);

  const streak = overallCurrentStreak(habits);
  const longest = overallLongestStreak(habits);

  const [activityCursor, setActivityCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const handlePreviousMonth = () => {
    setActivityCursor((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setActivityCursor((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const monthLabel = activityCursor.toLocaleDateString(undefined, { month: "long" });
  const yearLabel = activityCursor.getFullYear();
  const today = new Date();
  const isCurrentMonth =
    activityCursor.getFullYear() === today.getFullYear() &&
    activityCursor.getMonth() === today.getMonth();

  const [selectedBar, setSelectedBar] = useState<WeeklyDay | null>(null);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Statistics</h1>
        <p className="mt-1 text-muted-foreground">Your progress, gently visualized.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="rounded-3xl bg-card p-5 shadow-soft lg:col-span-2">
          <h2 className="mb-1 font-display text-xl font-bold">This week</h2>

          <div className="mb-2 min-h-[1.25rem] text-sm font-semibold text-foreground lg:hidden">
            {selectedBar ? (
              <span>
                {selectedBar.label}, {selectedBar.dateLabel} — {selectedBar.completed} habit{" "}
                {selectedBar.completed === 1 ? "" : "s"} completed
              </span>
            ) : (
              <span className="text-muted-foreground">Tap a bar to see details</span>
            )}
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly} barCategoryGap="30%">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey={isMobile ? "shortLabel" : "label"}
                  stroke="var(--color-muted-foreground)"
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "var(--color-accent)", opacity: 0.3 }}
                  content={<WeeklyBarTooltip />}
                />
                <Bar
                  dataKey="completed"
                  fill="var(--color-primary)"
                  radius={[12, 12, 4, 4]}
                  onClick={(data: WeeklyDay) => setSelectedBar(data)}
                  className="cursor-pointer"
                >
                  {weekly.map((entry) => (
                    <Cell
                      key={entry.iso}
                      fill="var(--color-primary)"
                      opacity={selectedBar && selectedBar.iso !== entry.iso ? 0.6 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-3xl bg-card p-5 shadow-soft">
          <div className="mb-5 flex items-center justify-center gap-4">
            <button
              onClick={handlePreviousMonth}
              className="rounded-full p-1 transition-colors hover:bg-muted"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="min-w-[120px] text-center">
              <div className="font-display text-xl font-bold leading-none">{monthLabel}</div>
              <div className="mt-1 text-sm text-muted-foreground">{yearLabel}</div>
            </div>
            <button
              onClick={handleNextMonth}
              disabled={isCurrentMonth}
              className={cn(
                "rounded-full p-1 transition-colors",
                isCurrentMonth ? "cursor-not-allowed opacity-30" : "hover:bg-muted",
              )}
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <ActivityHeatmap habits={habits} cursor={activityCursor} />
        </section>
      </div>
    </AppShell>
  );
}

function WeeklyBarTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: WeeklyDay }[];
}) {
  if (!active || !payload?.length) return null;
  const day = payload[0].payload;
  return (
    <div
      className="rounded-2xl border border-border bg-card px-3 py-2 shadow-lg"
      style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
    >
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {day.label}, {day.dateLabel}
      </div>
      <div className="mt-0.5 text-sm font-bold text-foreground">
        {day.completed} habit{day.completed === 1 ? "" : "s"} completed
      </div>
    </div>
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
    <div className={cn("rounded-3xl p-5 shadow-soft", color)}>
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

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function ActivityHeatmap({ habits, cursor }: { habits: Habit[]; cursor: Date }) {
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

  const todayISO = dateKey(new Date());
  const [selected, setSelected] = useState<{
    iso: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;
    const today = new Date();
    const isCurrentMonth =
      cursor.getMonth() === today.getMonth() && cursor.getFullYear() === today.getFullYear();
    const targetDate = isCurrentMonth
      ? today
      : new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const targetISO = dateKey(targetDate);
    const button = gridRef.current.querySelector<HTMLButtonElement>(`[data-iso="${targetISO}"]`);
    if (!button) return;

    const container = gridRef.current.getBoundingClientRect();
    const cell = button.getBoundingClientRect();
    const count = completedByDay.get(targetISO) ?? 0;

    setSelected({
      iso: targetISO,
      count,
      x: cell.left - container.left + cell.width / 2,
      y: cell.top - container.top,
    });
  }, [cursor, completedByDay]);

  return (
    <div className="relative rounded-2xl sm:p-5">
      <div className="mb-3 flex justify-center">
        {selected && (
          <div
            className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[85%] rounded-2xl border border-border bg-card px-3 py-2 shadow-lg transition-all duration-150"
            style={{
              left: selected.x,
              top: selected.y + 40,
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {new Date(selected.iso).toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </div>
            <div className="mt-0.5 text-sm font-bold text-foreground">
              {selected.count} habit{selected.count === 1 ? "" : "s"} completed
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold uppercase text-muted-foreground">
        {WEEKDAY_LABELS.map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>

      <div ref={gridRef} className="mt-1.5 grid grid-cols-7 gap-1.5">
        {days.map((d, i) => {
          if (!d) return <div key={i} className="aspect-square" />;
          const iso = dateKey(d);
          const inMonth = d.getMonth() === cursor.getMonth();
          const count = completedByDay.get(iso) ?? 0;
          const intensity = Math.min(count, 4);
          const isToday = iso === todayISO;
          const isSelected = selected?.iso === iso;

          return (
            <button
              key={iso}
              data-iso={iso}
              type="button"
              onClick={(e) => {
                const rect = gridRef.current!.getBoundingClientRect();
                const cell = e.currentTarget.getBoundingClientRect();
                setSelected({
                  iso,
                  count,
                  x: cell.left - rect.left + cell.width / 2,
                  y: cell.top - rect.top,
                });
              }}
              aria-label={`${iso} — ${count} habit${count === 1 ? "" : "s"} completed`}
              className={cn(
                "aspect-square rounded-[4px] transition-colors",
                !inMonth && "opacity-30",
                isToday && "ring-2 ring-primary ring-offset-1 ring-offset-muted",
                isSelected && "outline outline-2 outline-offset-1 outline-foreground/60",
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
