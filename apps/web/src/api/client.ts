import type {
  CreateUserRequest,
  UserResponse,
  RatingRequest,
  RatingResponse,
  ProfileGenerateResponse,
  ProfileUpdateRequest,
  RecommendationsResponse,
  SeedTitle,
} from "../types.js";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error: string }).error ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export async function createUser(data: CreateUserRequest): Promise<UserResponse> {
  return apiFetch<UserResponse>("/api/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getSeedTitles(): Promise<{ titles: SeedTitle[] }> {
  return apiFetch<{ titles: SeedTitle[] }>("/api/onboarding/seed-titles");
}

export async function saveRating(data: RatingRequest): Promise<RatingResponse> {
  return apiFetch<RatingResponse>("/api/ratings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function generateProfile(userId: string): Promise<ProfileGenerateResponse> {
  return apiFetch<ProfileGenerateResponse>("/api/profile/generate", {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

export async function updateProfile(data: ProfileUpdateRequest): Promise<{ updated: boolean }> {
  return apiFetch<{ updated: boolean }>("/api/profile/update", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getRecommendations(userId: string): Promise<RecommendationsResponse> {
  return apiFetch<RecommendationsResponse>(`/api/recommendations/${userId}`);
}
