import { z } from "zod";

export const MediaTypeSchema = z.enum(["movie", "tv", "anime"]);

export const RatingRequestSchema = z.object({
  userId: z.string().uuid(),
  tmdbId: z.number().int().positive(),
  title: z.string().min(1),
  mediaType: MediaTypeSchema,
  score: z.number().int().min(1).max(5),
});

export const RatingResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  tmdbId: z.number().int(),
  title: z.string(),
  mediaType: MediaTypeSchema,
  score: z.number().int(),
  ratedAt: z.string(),
});

export type MediaType = z.infer<typeof MediaTypeSchema>;
export type RatingRequest = z.infer<typeof RatingRequestSchema>;
export type RatingResponse = z.infer<typeof RatingResponseSchema>;
