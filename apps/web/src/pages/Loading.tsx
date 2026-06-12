import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { generateProfile } from "../api/client.js";
import { clearCachedRecommendations } from "../store/recommendations.js";

export function Loading() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId: string = (location.state as { userId: string })?.userId;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }

    clearCachedRecommendations();
    generateProfile(userId)
      .then(() => navigate("/recommendations", { state: { userId } }))
      .catch((e: unknown) => setError((e as Error).message ?? "Something went wrong"));
  }, [userId, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-red-400 text-sm font-medium">Failed to build profile</p>
        <p className="text-zinc-500 text-xs text-center max-w-sm">{error}</p>
        <button
          onClick={() => navigate("/")}
          className="mt-2 text-zinc-400 text-xs underline underline-offset-2"
        >
          Start over
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-5">
      <div className="w-8 h-8 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin" />
      <div className="text-center">
        <p className="text-zinc-300 text-sm font-medium">Building your taste profile</p>
        <p className="text-zinc-600 text-xs mt-1">Claude is reading between the lines…</p>
      </div>
    </div>
  );
}
