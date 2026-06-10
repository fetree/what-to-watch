import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PosterCard } from "../components/PosterCard.js";
import { Navbar } from "../components/Navbar.js";
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
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-semibold text-white mb-1">Find your next watch</h1>
            <p className="text-zinc-500 text-sm mb-8">
              Rate a few titles and we'll build a taste profile just for you.
            </p>
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmailState(e.target.value)}
                className="bg-zinc-900 text-white placeholder-zinc-600 border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-600 transition-colors"
              />
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="bg-white text-zinc-900 font-medium rounded-lg py-3 text-sm hover:bg-zinc-100 disabled:opacity-50 transition-colors"
              >
                {loading ? "Setting up…" : "Get started"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const ratedCount = Object.keys(ratings).length;
  const total = titles.length;

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Rate what you know</h1>
            <p className="text-zinc-500 text-sm mt-1">
              The more you rate, the better your recommendations.
            </p>
          </div>
          <div className="text-right shrink-0 ml-4">
            <span className="text-white font-medium tabular-nums">{ratedCount}</span>
            <span className="text-zinc-600 text-sm"> / {total}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-0.5 bg-zinc-800 rounded-full mb-8">
          <div
            className="h-0.5 bg-white rounded-full transition-all duration-300"
            style={{ width: total ? `${(ratedCount / total) * 100}%` : "0%" }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
          {titles.map((title) => (
            <PosterCard
              key={title.tmdbId}
              title={title}
              score={ratings[title.tmdbId] ?? 0}
              onRate={(score) => setRatings((prev) => ({ ...prev, [title.tmdbId]: score }))}
            />
          ))}
        </div>

        {error && <p className="text-red-400 text-xs mt-6">{error}</p>}

        <div className="mt-8 flex items-center justify-between">
          <p className="text-zinc-600 text-xs">
            {ratedCount < 5 ? `Rate ${5 - ratedCount} more to continue` : "Ready to go!"}
          </p>
          <button
            onClick={handleSubmit}
            disabled={loading || ratedCount < 5}
            className="bg-white text-zinc-900 font-medium rounded-lg px-6 py-2.5 text-sm hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Saving…" : "Build my profile →"}
          </button>
        </div>
      </main>
    </div>
  );
}
