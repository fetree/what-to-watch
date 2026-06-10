import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BlurbCard } from "../components/BlurbCard.js";
import { getRecommendations } from "../api/client.js";
import { getUserId } from "../store/user.js";
import type { RecommendationItem } from "@what-to-watch/shared";

export function Recommendations() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId: string =
    (location.state as { userId: string })?.userId ?? getUserId() ?? "";

  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }
    getRecommendations(userId)
      .then((r) => setItems(r.recommendations))
      .catch((e: unknown) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [userId, navigate]);

  async function handleFeedback(tmdbId: number) {
    setItems((prev) => prev.filter((i) => i.tmdbId !== tmdbId));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-zinc-600 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-red-400">{error}</p>
        <button
          onClick={() => navigate("/")}
          className="text-zinc-400 underline text-sm"
        >
          Start over
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Your picks</h1>
          <p className="text-zinc-400 mt-1 text-sm">
            Curated for your taste. Hit ✕ on anything that doesn't fit — your profile updates in real time.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <BlurbCard
              key={item.tmdbId}
              item={item}
              onFeedback={() => handleFeedback(item.tmdbId)}
            />
          ))}
        </div>
        {items.length === 0 && (
          <p className="text-zinc-500 text-center mt-12">
            All caught up — go back to rate more titles!
          </p>
        )}
      </div>
    </div>
  );
}
