import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, getToken, setToken, type ApiProfile } from "@/lib/api";

export type Frequency = "daily" | "weekly" | "custom";

export type Habit = {
  id: string;
  name: string;
  description?: string;
  category: string;
  frequency: Frequency;
  reminder?: string;
  color: "pink" | "lavender" | "sage" | "sky" | "cream";
  createdAt: string;
  /** ISO date strings (YYYY-MM-DD) marked complete */
  completions: string[];
  weekDays?: number[]; // Added weekDays property
};

export type Profile = ApiProfile;

export const CATEGORIES = [
  "Health",
  "Fitness",
  "Mindfulness",
  "Learning",
  "Productivity",
  "Creativity",
  "Social",
];
const COLORS: Habit["color"][] = ["pink", "lavender", "sage", "sky", "cream"];

export const todayKey = () => new Date().toISOString().slice(0, 10);
export const dateKey = (d: Date) => d.toISOString().slice(0, 10);

const emptyProfile: Profile = {
  username: "",
  email: "",
  avatar: "🌸",
};

type Ctx = {
  habits: Habit[];
  profile: Profile;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  authReady: boolean;
  setAuth: (token: string, profile: Profile) => void;
  addHabit: (
    h: Omit<Habit, "id" | "createdAt" | "completions" | "color"> & { color?: Habit["color"] },
  ) => void;
  updateHabit: (id: string, patch: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleComplete: (id: string, dateISO?: string) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  refresh: () => void;
  logout: () => void;
};

const HabitsContext = createContext<Ctx | null>(null);
  

export function HabitsProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);
  const [authReady, setAuthReady] = useState(false);
  const [token, setTokenState] = useState<string | null>(() => getToken());

  useEffect(() => {
    setAuthReady(true);
  }, []);

  const isAuthenticated = !!token;

  useEffect(() => {
  if (!token) {
    setHabits([]);
    setProfile(emptyProfile);
    setIsInitializing(false);
    return;
  }

  let cancelled = false;
  const start = Date.now();

  setIsLoading(true);

  Promise.all([api.listHabits<Habit>(), api.getProfile()])
    .then(([habitsRes, profileRes]) => {
      if (cancelled) return;
      setHabits(habitsRes);
      setProfile(profileRes);
    })
    .catch((err) => {
      console.error(err);
      if (err.status === 401) {
        setToken(null);
        setTokenState(null);
      }
    })
    .finally(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 1000 - elapsed);

      setTimeout(() => {
        if (!cancelled) {
          setIsLoading(false);
          setIsInitializing(false);
        }
      }, remaining);
    });

  return () => {
    cancelled = true;
  };
}, [refreshTick, token]);

  const value = useMemo<Ctx>(
    () => ({
      habits,
      profile,
      isAuthenticated,
      isLoading,
      isInitializing,
      authReady,
      setAuth: (newToken, newProfile) => {
        setToken(newToken); // Update localStorage
        setTokenState(newToken); // Update state to trigger useEffect
        setProfile(newProfile); // Update profile immediately
        setHabits([]); // Clear old habits immediately
        setRefreshTick((t) => t + 1);
      },
      refresh: () => setRefreshTick((t) => t + 1),
      logout: () => {
        setToken(null);
        setTokenState(null);
        setHabits([]);
        setProfile(emptyProfile);
      },

      addHabit: (h) => {
        const tempId = crypto.randomUUID();
        const optimistic: Habit = {
          id: tempId,
          createdAt: new Date().toISOString(),
          completions: [],
          color: h.color ?? COLORS[habits.length % COLORS.length],
          ...h,
        } as Habit;
        setHabits((prev) => [...prev, optimistic]);

        api
          .createHabit<Habit>({ ...h, color: optimistic.color })
          .then((created) => setHabits((prev) => prev.map((x) => (x.id === tempId ? created : x))))
          .catch((err) => {
            console.error("Failed to create habit", err);
            setHabits((prev) => prev.filter((x) => x.id !== tempId));
          });
      },

      updateHabit: (id, patch) => {
        setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch } : h)));
        api
          .updateHabit<Habit>(id, patch)
          .then((updated) => setHabits((prev) => prev.map((h) => (h.id === id ? updated : h))))
          .catch((err) => console.error("Failed to update habit", err));
      },

      deleteHabit: (id) => {
        const prevHabits = habits;
        setHabits((prev) => prev.filter((h) => h.id !== id));
        api.deleteHabit(id).catch((err) => {
          console.error("Failed to delete habit", err);
          setHabits(prevHabits);
        });
      },

      toggleComplete: (id, dateISO) => {
        const key = dateISO ?? todayKey();
        setHabits((prev) =>
          prev.map((h) => {
            if (h.id !== id) return h;
            const set = new Set(h.completions);
            if (set.has(key)) {
              set.delete(key);
            } else {
              set.add(key);
            }
            return { ...h, completions: Array.from(set).sort() };
          }),
        );
        api
          .toggleHabit<Habit>(id, key)
          .then((updated) => setHabits((prev) => prev.map((h) => (h.id === id ? updated : h))))
          .catch((err) => console.error("Failed to toggle habit completion", err));
      },

      updateProfile: (patch) => {
        setProfile((p) => ({ ...p, ...patch }));
        api
          .updateProfile(patch)
          .then((updated) => setProfile(updated))
          .catch((err) => console.error("Failed to update profile", err));
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }),
    [habits, profile, isAuthenticated, isLoading, token],
  );

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}

export function useHabits() {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error("useHabits must be used inside HabitsProvider");
  return ctx;
}

/* ---------- derived stats helpers ---------- */

export function isDueToday(h: Habit, date = new Date()): boolean {
  if (h.frequency === "daily") return true;
  if (h.frequency === "weekly") {
    // due on same weekday as createdAt
    const created = new Date(h.createdAt);
    return created.getDay() === date.getDay();
  }
  return true;
}

export function completedOn(h: Habit, date: Date) {
  return h.completions.includes(dateKey(date));
}

export function computeStreak(h: Habit): number {
  let streak = 0;
  const d = new Date();
  while (h.completions.includes(dateKey(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function longestStreak(h: Habit): number {
  if (h.completions.length === 0) return 0;
  const sorted = [...h.completions].sort();
  let best = 1,
    cur = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const now = new Date(sorted[i]);
    const diff = Math.round((now.getTime() - prev.getTime()) / 86_400_000);
    if (diff === 1) {
      cur++;
      best = Math.max(best, cur);
    } else {
      cur = 1;
    }
  }
  return best;
}

export function overallCurrentStreak(habits: Habit[]): number {
  // Count consecutive days back where at least one habit was completed.
  let streak = 0;
  const d = new Date();
  while (habits.some((h) => completedOn(h, d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function overallLongestStreak(habits: Habit[]): number {
  const dates = new Set<string>();
  habits.forEach((h) => h.completions.forEach((c) => dates.add(c)));
  const sorted = Array.from(dates).sort();
  if (sorted.length === 0) return 0;
  let best = 1,
    cur = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = Math.round(
      (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86_400_000,
    );
    if (diff === 1) {
      cur++;
      best = Math.max(best, cur);
    } else {
      cur = 1;
    }
  }
  return best;
}

export function isHabitCreatedBefore(habit: Habit, date: Date): boolean {
  const habitCreatedAt = new Date(habit.createdAt);
  // Compare dates by converting them to YYYY-MM-DD strings to ignore time
  return dateKey(habitCreatedAt) <= dateKey(date);
}
// Added a comment to force Docker cache invalidation