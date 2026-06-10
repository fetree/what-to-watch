import { StarRating } from "./StarRating.js";
import type { SeedTitle } from "@what-to-watch/shared";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w342";

interface PosterCardProps {
  title: SeedTitle;
  score: number;
  onRate: (score: number) => void;
}

export function PosterCard({ title, score, onRate }: PosterCardProps) {
  return (
    <div className="flex flex-col gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-3">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800">
        {title.posterPath ? (
          <img
            src={`${TMDB_IMAGE_BASE}${title.posterPath}`}
            alt={title.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-500 text-sm text-center px-2">
            {title.title}
          </div>
        )}
        {score > 0 && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="text-4xl font-bold text-white drop-shadow">★ {score}</span>
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-zinc-200 truncate">{title.title}</p>
        {title.year && <p className="text-xs text-zinc-500">{title.year}</p>}
      </div>
      <div className="flex justify-center">
        <StarRating value={score} onChange={onRate} />
      </div>
    </div>
  );
}
