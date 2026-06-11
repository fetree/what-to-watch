import { z } from "zod";
import { MediaTypeSchema } from "./rating.js";
export const RecommendationItemSchema = z.object({
    tmdbId: z.number().int(),
    title: z.string(),
    mediaType: z.string(),
    posterPath: z.string().nullable(),
    blurb: z.string(),
    genres: z.array(z.string()),
});
export const RecommendationsResponseSchema = z.object({
    recommendations: z.array(RecommendationItemSchema),
});
export const SeedTitleSchema = z.object({
    tmdbId: z.number().int(),
    title: z.string(),
    mediaType: MediaTypeSchema,
    posterPath: z.string().nullable(),
    year: z.number().int().nullable(),
});
//# sourceMappingURL=recommendation.js.map