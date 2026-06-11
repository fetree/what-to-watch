import type { RecommendationItem } from "../types.js";

const CACHE_KEY = "wtw_recommendations";
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

interface Cache {
  items: RecommendationItem[];
  cachedAt: number;
}

export function getCachedRecommendations(): RecommendationItem[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: Cache = JSON.parse(raw);
    if (Date.now() - cached.cachedAt > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return cached.items;
  } catch {
    return null;
  }
}

export function setCachedRecommendations(items: RecommendationItem[]): void {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ items, cachedAt: Date.now() }));
}

export function clearCachedRecommendations(): void {
  localStorage.removeItem(CACHE_KEY);
}
