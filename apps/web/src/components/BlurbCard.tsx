import type { RecommendationItem } from "@what-to-watch/shared";
import { updateProfile } from "../api/client.js";
import { getUserId } from "../store/user.js";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w342";

interface BlurbCardProps {
  item: RecommendationItem;
  onFeedback?: () => void;
}

export function BlurbCard({ item, onFeedback }: BlurbCardProps) {
  async function handleNotForMe() {
    const userId = getUserId();
    if (!userId) return;
    await updateProfile({ userId, tmdbId: item.tmdbId, title: item.title, feedback: "dislike" });
    onFeedback?.();
  }

  return (
    <div className="flex gap-4 bg-zinc-800/60 rounded-xl p-4 hover:bg-zinc-800 transition-colors">
      <div className="w-20 shrink-0 aspect-[2/3] rounded-lg overflow-hidden bg-zinc-700">
        {item.posterPath ? (
          <img
            src={`${TMDB_IMAGE_BASE}${item.posterPath}`}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs text-center p-1">
            {item.title}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-white">{item.title}</h3>
            <p className="text-xs text-zinc-400 mt-0.5 capitalize">
              {item.mediaType} · {item.genres.slice(0, 3).join(", ")}
            </p>
          </div>
          <button
            onClick={handleNotForMe}
            className="text-xs text-zinc-500 hover:text-red-400 transition-colors shrink-0 mt-0.5"
            title="Not for me"
          >
            ✕
          </button>
        </div>
        <p className="mt-2 text-sm text-zinc-300 leading-relaxed">{item.blurb}</p>
      </div>
    </div>
  );
}
