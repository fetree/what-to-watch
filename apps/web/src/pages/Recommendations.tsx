import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BlurbCard } from "../components/BlurbCard.js";
import { Navbar } from "../components/Navbar.js";
import { getRecommendations } from "../api/client.js";
import { getUserId } from "../store/user.js";
import {
  getCachedRecommendations,
  setCachedRecommendations,
  clearCachedRecommendations,
} from "../store/recommendations.js";
import type { RecommendationItem } from "@what-to-watch/shared";

export function Recommendations() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId: string =
    (location.state as { userId: string })?.userId ?? getUserId() ?? "";

  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(
    async (bustCache = false) => {
      if (!userId) {
        navigate("/");
        return;
      }

      if (!bustCache) {
        const cached = getCachedRecommendations();
        if (cached) {
          setItems(cached);
          setLoading(false);
          return;
        }
      }

      try {
        const r = await getRecommendations(userId);
        setCachedRecommendations(r.recommendations);
        setItems(r.recommendations);
      } catch (e: unknown) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userId, navigate],
  );

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  async function handleRefresh() {
    setRefreshing(true);
    clearCachedRecommendations();
    await fetchRecommendations(true);
  }

  async function handleFeedback(tmdbId: number) {
    const updated = items.filter((i) => i.tmdbId !== tmdbId);
    setItems(updated);
    setCachedRecommendations(updated);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-3 p-4">
        <p className="text-red-400 text-sm">{error}</p>
        <button onClick={() => navigate("/")} className="text-zinc-500 text-sm underline">
          Start over
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar onRefresh={handleRefresh} refreshing={refreshing} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-white">Your picks</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Hit ✕ on anything that doesn't fit — your profile updates in real time.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <BlurbCard
              key={item.tmdbId}
              item={item}
              onFeedback={() => handleFeedback(item.tmdbId)}
            />
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-16">
            <p className="text-zinc-500 text-sm">All caught up.</p>
            <button
              onClick={handleRefresh}
              className="mt-3 text-zinc-400 text-sm underline hover:text-white transition-colors"
            >
              Get new recommendations
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
