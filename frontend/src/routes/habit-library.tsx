import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Plus,
  ArrowLeft,
  Sparkles,
  Droplet,
  Carrot,
  Bed,
  Dumbbell,
  StretchHorizontal,
  Footprints,
  Flower,
  Feather,
  Wind,
  Book,
  GraduationCap,
  MonitorPlay,
  CalendarCheck,
  Target,
  Inbox,
  Palette,
  Pencil,
  Camera,
  MessageSquareText,
  Smile,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { HabitFormModal, type HabitFormValue } from "@/components/habit-form-modal";
import { useHabits, type Habit, CATEGORIES } from "@/lib/habits-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/habit-library")({
  head: () => ({ meta: [{ title: "Habit Library — Bloom" }] }),
  component: HabitLibraryPage,
});

// Define recommended habits here
const RECOMMENDED_HABITS_DATA: {
  [category: string]: (Omit<Habit, "id" | "createdAt" | "completions"> & { icon: string })[];
} = {
  Health: [
    {
      name: "Drink 8 glasses of water",
      description: "Stay hydrated throughout the day",
      category: "Health",
      frequency: "daily",
      color: "pink",
      icon: "Droplet",
    },
    {
      name: "Eat 5 servings of vegetables",
      description: "Boost your nutrient intake",
      category: "Health",
      frequency: "daily",
      color: "pink",
      icon: "Carrot",
    },
    {
      name: "Sleep for 8 hours",
      description: "Support recovery and overall health",
      category: "Health",
      frequency: "daily",
      color: "pink",
      icon: "Bed",
    },
  ],

  Fitness: [
    {
      name: "Exercise for 30 minutes",
      description: "Build strength and endurance",
      category: "Fitness",
      frequency: "daily",
      color: "sage",
      icon: "Dumbbell", // Changed from Run
    },
    {
      name: "Stretch for 10 minutes",
      description: "Improve flexibility and reduce stiffness",
      category: "Fitness",
      frequency: "daily",
      color: "sage",
      icon: "StretchHorizontal",
    },
    {
      name: "Reach 8,000 steps",
      description: "Stay active throughout the day",
      category: "Fitness",
      frequency: "daily",
      color: "sage",
      icon: "Footprints",
    },
  ],

  Mindfulness: [
    {
      name: "Meditate for 10 minutes",
      description: "Practice daily mindfulness",
      category: "Mindfulness",
      frequency: "daily",
      color: "lavender",
      icon: "Flower", // Changed from Lotus
    },
    {
      name: "Journal for 5 minutes",
      description: "Reflect on your thoughts and emotions",
      category: "Mindfulness",
      frequency: "daily",
      color: "lavender",
      icon: "Feather",
    },
    {
      name: "Practice deep breathing",
      description: "Reduce stress and improve focus",
      category: "Mindfulness",
      frequency: "daily",
      color: "lavender",
      icon: "Wind",
    },
  ],

  Learning: [
    {
      name: "Read for 20 minutes",
      description: "Expand your knowledge every day",
      category: "Learning",
      frequency: "daily",
      color: "cream",
      icon: "Book",
    },
    {
      name: "Learn a new skill",
      description: "Spend time improving an ability",
      category: "Learning",
      frequency: "daily",
      color: "cream",
      icon: "GraduationCap",
    },
    {
      name: "Watch an educational video",
      description: "Discover something new",
      category: "Learning",
      frequency: "daily",
      color: "cream",
      icon: "MonitorPlay",
    },
  ],

  Productivity: [
    {
      name: "Plan your day",
      description: "Organize tasks for better focus",
      category: "Productivity",
      frequency: "daily",
      color: "sky",
      icon: "CalendarCheck",
    },
    {
      name: "Complete your top priority",
      description: "Finish your most important task first",
      category: "Productivity",
      frequency: "daily",
      color: "sky",
      icon: "Target",
    },
    {
      name: "Clear your inbox",
      description: "Maintain a tidy digital workspace",
      category: "Productivity",
      frequency: "daily",
      color: "sky",
      icon: "Inbox",
    },
  ],

  Creativity: [
    {
      name: "Draw or sketch for 15 minutes",
      description: "Express your creativity visually",
      category: "Creativity",
      frequency: "daily",
      color: "sage",
      icon: "Palette",
    },
    {
      name: "Write for 10 minutes",
      description: "Practice creative thinking through writing",
      category: "Creativity",
      frequency: "daily",
      color: "sage",
      icon: "Pencil",
    },
    {
      name: "Capture one photo",
      description: "Notice beauty and interesting moments",
      category: "Creativity",
      frequency: "daily",
      color: "sage",
      icon: "Camera",
    },
  ],

  Social: [
    {
      name: "Message a friend or family member",
      description: "Stay connected with loved ones",
      category: "Social",
      frequency: "daily",
      color: "sky",
      icon: "MessageSquareText",
    },
    {
      name: "Give someone a compliment",
      description: "Spread positivity through kind words",
      category: "Social",
      frequency: "daily",
      color: "sky",
      icon: "Smile",
    },
    {
      name: "Have a meaningful conversation",
      description: "Strengthen relationships through connection",
      category: "Social",
      frequency: "daily",
      color: "sky",
      icon: "Users",
    },
  ],
};

const colorMap: Record<string, string> = {
  sky: "bg-sky-100",
  sage: "bg-emerald-100", // Using emerald for sage-like color
  pink: "bg-pink-100",
  lavender: "bg-indigo-100", // Using indigo for lavender-like color
  cream: "bg-amber-100", // Using amber for cream-like color
};

// Map icon names to actual Lucid React components
const ICON_COMPONENTS: Record<string, React.ElementType> = {
  Droplet,
  Carrot,
  Bed, // Changed from Run
  StretchHorizontal,
  Dumbbell,
  Footprints,
  Flower, // Changed from Lotus
  Feather,
  Wind,
  Book,
  GraduationCap,
  MonitorPlay,
  CalendarCheck,
  Target,
  Inbox,
  Palette,
  Pencil,
  Camera,
  MessageSquareText,
  Smile,
  Users,
  Sparkles, // Keep Sparkles as a fallback
};

function HabitLibraryPage() {
  const { addHabit } = useHabits();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [isRecommendedHabit, setIsRecommendedHabit] = useState(false);

  const handleCreateOwnHabit = () => {
    setEditing(null);
    setIsRecommendedHabit(false);
    setOpen(true);
  };

  const handleAddRecommendedHabit = (
    habitData: Omit<Habit, "id" | "createdAt" | "completions"> & { icon: string },
  ) => {
    const tempHabit: Habit = {
      id: "temp-recommended-" + Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString(),
      completions: [],
      ...habitData,
    };
    setEditing(tempHabit);
    setIsRecommendedHabit(true);
    setOpen(true);
  };

  const handleSubmit = (v: HabitFormValue) => {
    addHabit(v);
    toast.success(isRecommendedHabit ? "Recommended habit added ✨" : "Habit added ✨");
    navigate({ to: "/habits" }); // Navigate back to habits page after adding
  };

  return (
    <AppShell>
      <div className="container mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/habits" })}
            className="h-10 w-10 rounded-full"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <h1 className="font-display text-3xl font-bold sm:text-4xl">Habit Library</h1>
        </div>

        <Button
          onClick={handleCreateOwnHabit}
          className="w-full md:w-auto rounded-2xl bg-primary text-primary-foreground shadow-soft hover:bg-primary/90 mb-10"
        >
          <Plus className="mr-1 h-4 w-4" />
          Create Own Habit
        </Button>

        <h2 className="font-display text-2xl font-bold mb-6">Recommended Habits</h2>
        <div className="grid gap-8">
          {Object.entries(RECOMMENDED_HABITS_DATA).map(([category, habits]) => (
            <div key={category}>
              <h3 className="text-xl font-semibold mb-4">{category}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {habits.map((habit) => {
                  const IconComponent = ICON_COMPONENTS[habit.icon] || Sparkles;
                  return (
                    <div
                      key={habit.name}
                      className={cn(
                        "relative flex flex-col justify-between rounded-xl border border-border p-4 shadow-sm",
                        colorMap[habit.color],
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-6 w-6 items-center justify-center">
                          <IconComponent className="h-6 w-6 text-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-display text-base font-bold text-foreground mr-4">
                            {habit.name}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">{habit.description}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-10 w-10 shrink-0 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary"
                        onClick={() => handleAddRecommendedHabit(habit)}
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <HabitFormModal
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) {
            setEditing(null);
            setIsRecommendedHabit(false);
          }
        }}
        initial={editing}
        isRecommended={isRecommendedHabit}
        onSubmit={handleSubmit}
      />
    </AppShell>
  );
}
