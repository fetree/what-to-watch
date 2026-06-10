import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PosterCard } from "../components/PosterCard.js";
import { createUser, getSeedTitles, saveRating } from "../api/client.js";
import { getUserId, setUserId, setEmail } from "../store/user.js";
import type { SeedTitle } from "@what-to-watch/shared";

export function Onboarding() {
  const navigate = useNavigate();
  const [email, setEmailState] = useState("");
  const [userId, setUserIdState] = useState<string | null>(getUserId());
  const [titles, setTitles] = useState<SeedTitle[]>([]);
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      getSeedTitles()
        .then((r) => setTitles(r.titles))
        .catch((e: unknown) => setError((e as Error).message));
    }
  }, [userId]);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await createUser({ email });
      setUserId(user.userId);
      setEmail(email);
      setUserIdState(user.userId);
      const r = await getSeedTitles();
      setTitles(r.titles);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!userId) return;
    const ratedCount = Object.keys(ratings).length;
    if (ratedCount < 5) {
      setError("Rate at least 5 titles so we can build your taste profile.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await Promise.all(
        Object.entries(ratings).map(([tmdbId, score]) => {
          const title = titles.find((t) => t.tmdbId === Number(tmdbId))!;
          return saveRating({
            userId,
            tmdbId: Number(tmdbId),
            title: title.title,
            mediaType: title.mediaType,
            score,
          });
        }),
      );
      navigate("/loading", { state: { userId } });
    } catch (e: unknown) {
      setError((e as Error).message);
      setLoading(false);
    }
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-bold text-white mb-2">What to Watch</h1>
          <p className="text-zinc-400 mb-8">
            Rate a few titles and we'll build your personal taste profile.
          </p>
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmailState(e.target.value)}
              className="bg-zinc-800 text-white placeholder-zinc-500 border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-zinc-400"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="bg-white text-zinc-900 font-semibold rounded-lg py-3 hover:bg-zinc-100 disabled:opacity-50 transition-colors"
            >
              {loading ? "Setting up…" : "Get started"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const ratedCount = Object.keys(ratings).length;

  return (
    <div className="min-h-screen bg-zinc-900 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Rate what you know</h1>
          <p className="text-zinc-400 mt-1">
            Rate {titles.length} titles — the more you rate, the better your recommendations.
          </p>
          <p className="text-zinc-500 text-sm mt-1">{ratedCount} rated</p>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
          {titles.map((title) => (
            <PosterCard
              key={title.tmdbId}
              title={title}
              score={ratings[title.tmdbId] ?? 0}
              onRate={(score) => setRatings((prev) => ({ ...prev, [title.tmdbId]: score }))}
            />
          ))}
        </div>
        {error && <p className="text-red-400 text-sm mt-6">{error}</p>}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading || ratedCount < 5}
            className="bg-white text-zinc-900 font-semibold rounded-lg px-8 py-3 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Saving…" : `Build my taste profile →`}
          </button>
        </div>
      </div>
    </div>
  );
}
