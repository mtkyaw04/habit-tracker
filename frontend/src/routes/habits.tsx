import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Filter } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { HabitCard } from "@/components/habit-card";
import { HabitFormModal, type HabitFormValue } from "@/components/habit-form-modal";
import { useHabits, type Habit, CATEGORIES, todayKey } from "@/lib/habits-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/habits")({
  head: () => ({ meta: [{ title: "Habits — Bloom" }] }),
  component: HabitsPage,
});

function HabitsPage() {
  const { habits, addHabit, updateHabit, deleteHabit, toggleComplete } = useHabits();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [filter, setFilter] = useState<string>("All");

  const filtered = filter === "All" ? habits : habits.filter((h) => h.category === filter);

  return (
    <AppShell>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Your habits</h1>
          <p className="mt-1 text-muted-foreground">
            {habits.length} habit{habits.length === 1 ? "" : "s"} in your garden 🌷
          </p>
        </div>
        <Button
          onClick={() => { setEditing(null); setOpen(true); }}
          className="hidden rounded-2xl bg-primary text-primary-foreground shadow-soft hover:bg-primary/90 md:inline-flex"
        >
          <Plus className="mr-1 h-4 w-4" /> Add habit
        </Button>
      </div>

      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
        <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Filter className="h-3.5 w-3.5" /> Filter
        </span>
        {["All", ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={cn(
              "whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
              filter === c
                ? "border-transparent bg-primary/70 text-primary-foreground shadow-soft"
                : "border-border bg-card/60 text-muted-foreground hover:bg-accent",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/60 p-10 text-center shadow-soft">
          <h3 className="font-display text-lg font-semibold">No habits here yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Tap the button below to start.</p>
          <Button
            onClick={() => { setEditing(null); setOpen(true); }}
            className="mt-4 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="mr-1 h-4 w-4" /> Add your first habit
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((h) => (
            <HabitCard
              key={h.id}
              habit={h}
              onToggle={() => {
                toggleComplete(h.id);
                const nowDone = !h.completions.includes(todayKey());
                toast.success(nowDone ? `Nice work — ${h.name} ✨` : `Unmarked ${h.name}`);
              }}
              onEdit={() => { setEditing(h); setOpen(true); }}
              onDelete={() => { deleteHabit(h.id); toast(`Removed ${h.name}`); }}
            />
          ))}
        </div>
      )}

      {/* Floating add button (mobile) */}
      <button
        onClick={() => { setEditing(null); setOpen(true); }}
        className="fixed bottom-24 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-cozy transition-transform hover:scale-105 md:hidden"
        aria-label="Add habit"
      >
        <Plus className="h-6 w-6" />
      </button>

      <HabitFormModal
        open={open}
        onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}
        initial={editing}
        onSubmit={(v: HabitFormValue) => {
          if (editing) {
            updateHabit(editing.id, v);
            toast.success("Habit updated");
          } else {
            addHabit(v);
            toast.success("Habit added ✨");
          }
        }}
      />
    </AppShell>
  );
}
