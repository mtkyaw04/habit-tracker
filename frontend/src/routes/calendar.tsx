import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useHabits, dateKey, isHabitCreatedBefore } from "@/lib/habits-store";
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
        if (!isHabitCreatedBefore(h, parseISO(d))) return;

        const arr = map.get(d) ?? [];
        arr.push(h.name);
        map.set(d, arr);
      });
    });

    return map;
  }, [habits]);

  const selectedDate = parseISO(selected);

  const selectedDay = selectedDate.getDay();
  const isPast = selected < todayISO;
  const isTodaySelected = selected === todayISO;
  const isFuture = selected > todayISO;

  // Only habits that are due on the selected date
  const scheduledHabits = habits.filter((habit) => {
    // Do not show habits before they were created
    if (!isHabitCreatedBefore(habit, selectedDate)) {
      return false;
    }

    if (habit.frequency === "daily") {
      return true;
    }

    return habit.weekDays?.includes(selectedDay);
  });

  const completedHabits = scheduledHabits.filter((habit) => habit.completions.includes(selected));

  const missedHabits = isPast
    ? scheduledHabits.filter((habit) => !habit.completions.includes(selected))
    : [];

  const pendingHabits =
    isTodaySelected || isFuture
      ? scheduledHabits.filter((habit) => !habit.completions.includes(selected))
      : [];

  return (
    <AppShell>
      <div className="mb-4">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Calendar</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl bg-card p-4 shadow-soft">
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
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-3">
            {days.map((d, i) => {
              if (!d) return <div key={i} />;
              const iso = dateKey(d);
              const done = completedByDay.get(iso) ?? [];
              const inMonth = d.getMonth() === cursor.getMonth();
              const isToday = iso === todayISO;
              const isSelected = iso === selected;
              return (
                <button
                  key={iso}
                  onClick={() => setSelected(iso)}
                  className={cn(
                    "relative mx-auto grid h-10 w-10 place-items-center rounded-full text-sm font-semibold transition-all",
                    !inMonth && "opacity-40",
                    isSelected
                      ? "bg-muted ring-2 ring-primary"
                      : "bg-muted text-foreground hover:bg-accent",
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

        <aside className="rounded-2xl bg-card p-4 shadow-soft">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {selectedDate.toLocaleDateString(undefined, { weekday: "long" })}
          </div>

          <h3 className="mt-1 font-display text-2xl font-bold">
            {selectedDate.toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
            })}
          </h3>

          <div className="mt-6 space-y-6 max-h-[300px] overflow-y-auto pr-2 thin-scrollbar">
            {/* Completed */}
            <section>
              <h4 className="mb-2 text-sm font-semibold text-green-600">
                Completed ({completedHabits.length})
              </h4>

              {completedHabits.length > 0 ? (
                <ul className="space-y-2">
                  {completedHabits.map((habit) => (
                    <li
                      key={habit.id}
                      className="rounded-xl bg-green-100 px-4 py-2 text-sm font-medium text-green-700"
                    >
                      ✓ {habit.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">None</p>
              )}
            </section>

            {/* Missed */}
            {isPast && (
              <section>
                <h4 className="mb-2 text-sm font-semibold text-red-600">
                  Missed ({missedHabits.length})
                </h4>

                {missedHabits.length > 0 ? (
                  <ul className="space-y-2">
                    {missedHabits.map((habit) => (
                      <li
                        key={habit.id}
                        className="rounded-xl bg-red-100 px-4 py-2 text-sm font-medium text-red-700"
                      >
                        ✕ {habit.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">None</p>
                )}
              </section>
            )}

            {/* Pending */}
            {(isTodaySelected || isFuture) && (
              <section>
                <h4 className="mb-2 text-sm font-semibold text-gray-500">
                  Pending ({pendingHabits.length})
                </h4>

                {pendingHabits.length > 0 ? (
                  <ul className="space-y-2">
                    {pendingHabits.map((habit) => (
                      <li
                        key={habit.id}
                        className="rounded-xl bg-muted px-4 py-2 text-sm font-medium text-muted-foreground"
                      >
                        ○ {habit.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">None</p>
                )}
              </section>
            )}
          </div>
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
