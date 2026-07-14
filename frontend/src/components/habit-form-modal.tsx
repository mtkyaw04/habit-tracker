import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, type Frequency, type Habit } from "@/lib/habits-store";

export type HabitFormValue = {
  name: string;
  description?: string;
  category: string;
  frequency: Frequency;
  reminder?: string;
  color?: Habit["color"];
};

export function HabitFormModal({
  open,
  onOpenChange,
  onSubmit,
  initial,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (v: HabitFormValue) => void;
  initial?: Habit | null;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [reminder, setReminder] = useState("");
  const [color, setColor] = useState<Habit["color"]>("pink");

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setDescription(initial?.description ?? "");
      setCategory(initial?.category ?? CATEGORIES[0]);
      setFrequency(initial?.frequency ?? "daily");
      setReminder(initial?.reminder ?? "");
      setColor(initial?.color ?? "pink");
    }
  }, [open, initial]);

  const submit = () => {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      frequency,
      reminder: reminder || undefined,
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
            {initial ? "Edit habit" : "Add a new habit"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Habit name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning meditation"
              className="rounded-2xl"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional — what makes this habit meaningful?"
              className="min-h-20 rounded-2xl"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as Frequency)}>
                <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="reminder">Reminder time (optional)</Label>
            <Input
              id="reminder"
              type="time"
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              className="rounded-2xl"
            />
          </div>

          <div className="grid gap-2">
            <Label>Color</Label>
            <div className="flex gap-3">
              {swatches.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-10 w-10 rounded-2xl border-2 bg-${c} transition-all ${
                    color === c ? "border-foreground scale-110" : "border-transparent"
                  }`}
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
          <Button onClick={submit} className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
