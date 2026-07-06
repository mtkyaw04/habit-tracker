// Thin fetch wrapper for talking to the Node.js/Express backend.
// Base URL is injected at build time via VITE_API_URL (see .env / Docker Compose).

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const TOKEN_KEY = "habitTracker.token.v1";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 204) return undefined as T;

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message = (body && (body as { error?: string }).error) || res.statusText;
    throw new ApiError(message, res.status);
  }
  return body as T;
}

export type ApiProfile = {
  username: string;
  email: string;
  avatar: string;
};

export const api = {
  register: (username: string, email: string, password: string) =>
    request<{
      token: string;
      profile: ApiProfile;
    }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    }),
  login: (email: string, password: string) =>
    request<{
      token: string;
      profile: ApiProfile;
    }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  getProfile: () => request<ApiProfile>("/api/profile"),
  updateProfile: (patch: Record<string, unknown>) =>
    request<ApiProfile>("/api/profile", {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  listHabits: <T>() => request<T[]>("/api/habits"),
  createHabit: <T>(payload: Record<string, unknown>) =>
    request<T>("/api/habits", { method: "POST", body: JSON.stringify(payload) }),
  updateHabit: <T>(id: string, patch: Record<string, unknown>) =>
    request<T>(`/api/habits/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  deleteHabit: (id: string) => request<void>(`/api/habits/${id}`, { method: "DELETE" }),
  toggleHabit: <T>(id: string, date?: string) =>
    request<T>(`/api/habits/${id}/toggle`, { method: "POST", body: JSON.stringify({ date }) }),
};
