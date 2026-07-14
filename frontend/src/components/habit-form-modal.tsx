import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES, type Frequency, type Habit } from "@/lib/habits-store";
import { cn } from "@/lib/utils";

export type HabitFormValue = {
  name: string;
  description?: string;
  category: string;
  frequency: Frequency;
  weekDays?: number[];
  color?: Habit["color"];
};

const WEEK_DAYS = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

const COLOR_CLASSES: Record<Habit["color"], string> = {
  pink: "bg-pink",
  lavender: "bg-lavender",
  sage: "bg-sage",
  sky: "bg-sky",
  cream: "bg-cream",
};

export function HabitFormModal({
  open,
  onOpenChange,
  onSubmit,
  initial,
  isRecommended = false, // New prop with default false
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (v: HabitFormValue) => void;
  initial?: Habit | null;
  isRecommended?: boolean; // New prop
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [weekDays, setWeekDays] = useState<number[]>([]);
  const [color, setColor] = useState<Habit["color"]>("pink");

  // Error states
  const [nameError, setNameError] = useState<string | null>(null);
  const [weekDaysError, setWeekDaysError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      // Clear all states when modal closes
      setName("");
      setDescription("");
      setCategory(CATEGORIES[0]);
      setFrequency("daily");
      setWeekDays([]);
      setColor("pink");
      setNameError(null);
      setWeekDaysError(null);
      return;
    }

    setName(initial?.name ?? "");
    setDescription(initial?.description ?? "");
    setCategory(initial?.category ?? CATEGORIES[0]);
    setFrequency(initial?.frequency ?? "daily");
    setWeekDays(initial?.weekDays ?? []);
    setColor(initial?.color ?? "pink");
    setNameError(null); // Clear errors on open
    setWeekDaysError(null); // Clear errors on open
  }, [open, initial]);

  const toggleWeekDay = (day: number) => {
    setWeekDays((prev) => {
      const isSelected = prev.includes(day);
      let newWeekDays;

      if (isSelected) {
        newWeekDays = prev.filter((d) => d !== day);
      } else {
        if (prev.length >= 6) {
          setWeekDaysError("You can choose up to 6 days.");
          return prev; // Prevent adding more than 6 days
        }
        newWeekDays = [...prev, day].sort((a, b) => a - b);
      }
      setWeekDaysError(null); // Clear error when selection changes
      return newWeekDays;
    });
  };

  const submit = () => {
    let hasError = false;

    // Validate habit name
    if (!name.trim()) {
      setNameError("Please Fill in habit name.");
      hasError = true;
    } else {
      setNameError(null);
    }

    // Validate weekly frequency days
    if (frequency === "weekly") {
      if (weekDays.length === 0) {
        setWeekDaysError("Please select at least one day for a weekly habit.");
        hasError = true;
      } else if (weekDays.length > 6) {
        setWeekDaysError("You can choose up to 6 days for a weekly habit.");
        hasError = true;
      } else {
        setWeekDaysError(null);
      }
    } else {
      setWeekDaysError(null); // Clear weekly days error if frequency is not weekly
    }

    if (hasError) {
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      frequency,
      weekDays: frequency === "weekly" ? weekDays : undefined,
      color,
    });

    onOpenChange(false);
  };

  const swatches: Habit["color"][] = ["pink", "lavender", "sage", "sky", "cream"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {initial && !isRecommended ? "Edit habit" : "Add a new habit"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Habit name</Label>

            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError(null); // Clear error on change
              }}
              placeholder="e.g. Morning meditation"
              className={cn(
                "rounded-2xl",
                nameError && "border-destructive focus-visible:ring-destructive",
              )}
              disabled={isRecommended} // Disable if it's a recommended habit
            />
            {nameError && <p className="text-sm text-destructive">{nameError}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="desc">Description</Label>

            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional — what makes this habit meaningful?"
              className="min-h-20 rounded-2xl"
              disabled={isRecommended} // Disable if it's a recommended habit
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Category</Label>

              <Select value={category} onValueChange={setCategory} disabled={isRecommended}> {/* Disable if it's a recommended habit */}
                <SelectTrigger className="rounded-2xl">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Frequency</Label>

              <Select
                value={frequency}
                onValueChange={(v) => {
                  setFrequency(v as Frequency);
                  setWeekDaysError(null); // Clear weekly days error if frequency changes
                }}
              >
                <SelectTrigger className="rounded-2xl">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {frequency === "weekly" && (
              <div className="grid gap-2 sm:col-span-2">
                <Label>Repeat on</Label>

                <div className="flex flex-wrap gap-2">
                  {WEEK_DAYS.map((day) => {
                    const selected = weekDays.includes(day.value);

                    return (
                      <Button
                        key={day.value}
                        type="button"
                        variant={selected ? "default" : "outline"}
                        className={cn("rounded-full px-4", weekDaysError && "border-destructive")}
                        onClick={() => toggleWeekDay(day.value)}
                      >
                        {day.label}
                      </Button>
                    );
                  })}
                </div>
                {weekDaysError && <p className="text-sm text-destructive">{weekDaysError}</p>}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Color</Label>

            <div className="flex gap-3">
              {swatches.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-10 w-10 rounded-2xl border-2 transition-all",
                    COLOR_CLASSES[c],
                    color === c ? "scale-110 border-foreground" : "border-transparent",
                  )}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl">
            Cancel
          </Button>

          <Button
            onClick={submit}
            className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}