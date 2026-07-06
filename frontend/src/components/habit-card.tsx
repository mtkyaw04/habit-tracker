import { Check, Pencil, Trash2, Repeat } from "lucide-react";
import { type Habit, todayKey, computeStreak } from "@/lib/habits-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const COLOR_BG: Record<Habit["color"], string> = {
  pink: "bg-pink/60",
  lavender: "bg-lavender/60",
  sage: "bg-sage/60",
  sky: "bg-sky/60",
  cream: "bg-cream/80",
};

const COLOR_DOT: Record<Habit["color"], string> = {
  pink: "bg-pink",
  lavender: "bg-lavender",
  sage: "bg-sage",
  sky: "bg-sky",
  cream: "bg-[oklch(0.88_0.07_85)]",
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatFrequency(habit: Habit) {
  if (habit.frequency === "daily") return "Daily";

  if (habit.frequency === "weekly") {
    const labels =
      habit.weekDays
        ?.map((d) => WEEKDAY_LABELS[d])
        .filter(Boolean) ?? [];

    return labels.length ? `Weekly • ${labels.join(", ")}` : "Weekly";

  }

  return habit.frequency;
}

export function HabitCard({
  habit,
  onToggle,
  onEdit,
  onDelete,
}: {
  habit: Habit;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const done = habit.completions.includes(todayKey());
  const streak = computeStreak(habit);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-white/60 p-5 shadow-soft transition-all hover:shadow-cozy",
        COLOR_BG[habit.color],
      )}
    > <div className="flex items-start justify-between gap-3"> <div className="min-w-0"> <div className="mb-1 flex items-center gap-2">
      <span className={cn("h-2.5 w-2.5 rounded-full", COLOR_DOT[habit.color])} /> <span className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
        {habit.category} </span> </div>

      <h3 className="truncate font-display text-lg font-bold text-foreground">
        {habit.name}
      </h3>

      {habit.description ? (
        <p className="mt-1 line-clamp-2 text-sm text-foreground/70">
          {habit.description}
        </p>
      ) : null}
    </div>

        <button
          onClick={onToggle}
          aria-label={done ? "Mark incomplete" : "Mark complete"}
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-2xl border-2 transition-all",
            done
              ? "border-transparent bg-foreground text-background shadow-soft"
              : "border-foreground/25 bg-white/40 text-foreground/50 hover:border-foreground/60",
          )}
        >
          <Check className={cn("h-5 w-5 transition-transform", done ? "scale-100" : "scale-75")} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/60 px-3 py-1 font-semibold text-foreground/80">
          <Repeat className="h-3.5 w-3.5" /> {formatFrequency(habit)}
        </span>



        <span className="inline-flex items-center gap-1 rounded-full bg-white/60 px-3 py-1 font-semibold text-foreground/80">
          🔥 {streak} day{streak === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Button
          size="sm"
          onClick={onToggle}
          className={cn(
            "flex-1 rounded-2xl font-semibold",
            done
              ? "bg-foreground text-background hover:bg-foreground/90"
              : "bg-white/70 text-foreground hover:bg-white",
          )}
        >
          {done ? "Completed" : "Complete"}
        </Button>

        <Button
          size="icon"
          variant="ghost"
          onClick={onEdit}
          className="rounded-2xl bg-white/50 hover:bg-white/80"
          aria-label="Edit"
        >
          <Pencil className="h-4 w-4" />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          onClick={onDelete}
          className="rounded-2xl bg-white/50 text-destructive hover:bg-white/80"
          aria-label="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>

  );
}
