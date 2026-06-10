import { useNavigate, useLocation } from "react-router-dom";
import { getEmail } from "../store/user.js";

interface NavbarProps {
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function Navbar({ onRefresh, refreshing }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const email = getEmail();
  const onRecommendations = location.pathname === "/recommendations";

  return (
    <header className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur border-b border-zinc-800">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="text-white font-semibold tracking-tight hover:text-zinc-300 transition-colors"
        >
          What to Watch
        </button>

        <div className="flex items-center gap-4">
          {email && (
            <span className="text-zinc-500 text-sm hidden sm:block">{email}</span>
          )}
          {onRecommendations && onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="text-sm text-zinc-400 hover:text-white disabled:opacity-40 transition-colors flex items-center gap-1.5"
            >
              <svg
                className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
