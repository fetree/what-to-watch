import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { generateProfile } from "../api/client.js";

export function Loading() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId: string = (location.state as { userId: string })?.userId;

  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }

    generateProfile(userId)
      .then(() => navigate("/recommendations", { state: { userId } }))
      .catch(() => navigate("/", { replace: true }));
  }, [userId, navigate]);

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center gap-6">
      <div className="w-12 h-12 border-4 border-zinc-600 border-t-white rounded-full animate-spin" />
      <div className="text-center">
        <p className="text-white font-medium">Building your taste profile…</p>
        <p className="text-zinc-500 text-sm mt-1">Claude is reading between the lines</p>
      </div>
    </div>
  );
}
