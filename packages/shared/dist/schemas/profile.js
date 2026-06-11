import { z } from "zod";
export const ProfileGenerateResponseSchema = z.object({
    tasteProfileText: z.string(),
    qdrantPointId: z.string(),
});
export const ProfileUpdateRequestSchema = z.object({
    userId: z.string().uuid(),
    tmdbId: z.number().int().positive(),
    title: z.string().min(1),
    feedback: z.enum(["like", "dislike"]),
});
//# sourceMappingURL=profile.js.map