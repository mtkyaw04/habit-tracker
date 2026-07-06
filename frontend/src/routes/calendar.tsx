import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useHabits, dateKey } from "@/lib/habits-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Calendar — Bloom" }] }),
  component: CalendarPage,
});

/** Safe way to parse a YYYY-MM-DD string into a local Date object */
function parseISO(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function CalendarPage() {
  const { habits } = useHabits();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState<string>(dateKey(new Date()));

  const days = useMemo(() => buildMonth(cursor), [cursor]);
  const todayISO = dateKey(new Date());

  const completedByDay = useMemo(() => {
    const map = new Map<string, string[]>();
    habits.forEach((h) => {
      h.completions.forEach((d) => {
        const arr = map.get(d) ?? [];
        arr.push(h.name);
        map.set(d, arr);
      });
    });
    return map;
  }, [habits]);

  const selectedList = completedByDay.get(selected) ?? [];
  const selectedDate = parseISO(selected);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Calendar</h1>
        <p className="mt-1 text-muted-foreground">Look back on the days you showed up.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-3xl bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              className="grid h-9 w-9 place-items-center rounded-full bg-accent/60 hover:bg-accent"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h2 className="font-display text-xl font-bold">
              {cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </h2>
            <button
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              className="grid h-9 w-9 place-items-center rounded-full bg-accent/60 hover:bg-accent"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="py-2">
                {d}
              </div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1.5">
            {days.map((d, i) => {
              if (!d) return <div key={i} />;
              const iso = dateKey(d);
              const done = completedByDay.get(iso) ?? [];
              const inMonth = d.getMonth() === cursor.getMonth();
              const isToday = iso === todayISO;
              const isSelected = iso === selected;
              const intensity = Math.min(done.length, 4);
              return (
                <button
                  key={iso}
                  onClick={() => setSelected(iso)}
                  className={cn(
                    "relative aspect-square rounded-2xl text-sm font-semibold transition-all",
                    !inMonth && "opacity-40",
                    isSelected ? "ring-2 ring-primary" : "",
                    intensity === 0 && "bg-muted text-foreground/70 hover:bg-accent/60",
                    intensity === 1 && "bg-sage/40 text-foreground",
                    intensity === 2 && "bg-sage/60 text-foreground",
                    intensity === 3 && "bg-sage text-sage-foreground",
                    intensity >= 4 && "bg-sage text-sage-foreground shadow-soft",
                  )}
                >
                  <span>{d.getDate()}</span>
                  {isToday && (
                    <span className="absolute inset-x-0 bottom-1 mx-auto h-1 w-1 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <aside className="rounded-3xl bg-card p-5 shadow-soft">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {selectedDate.toLocaleDateString(undefined, { weekday: "long" })}
          </div>
          <h3 className="mt-1 font-display text-2xl font-bold">
            {selectedDate.toLocaleDateString(undefined, { month: "long", day: "numeric" })}
          </h3>

          {selectedList.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">No habits completed on this day.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {selectedList.map((n, i) => (
                <li
                  key={i}
                  className="rounded-2xl bg-sage/40 px-4 py-2.5 text-sm font-semibold text-sage-foreground"
                >
                  ✓ {n}
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </AppShell>
  );
}

function buildMonth(cursor: Date): (Date | null)[] {
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
