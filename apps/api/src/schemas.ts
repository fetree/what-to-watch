import { z } from "zod";

export const MediaTypeSchema = z.enum(["movie", "tv", "anime"]);

export const CreateUserRequestSchema = z.object({
  email: z.string().email(),
});

export const RatingRequestSchema = z.object({
  userId: z.string().uuid(),
  tmdbId: z.number().int().positive(),
  title: z.string().min(1),
  mediaType: MediaTypeSchema,
  score: z.number().int().min(1).max(5),
});

export const ProfileUpdateRequestSchema = z.object({
  userId: z.string().uuid(),
  tmdbId: z.number().int().positive(),
  title: z.string().min(1),
  feedback: z.enum(["like", "dislike"]),
});

export const RecommendationItemSchema = z.object({
  tmdbId: z.number().int(),
  title: z.string(),
  mediaType: z.string(),
  posterPath: z.string().nullable(),
  blurb: z.string(),
  genres: z.array(z.string()),
});

export const SeedTitleSchema = z.object({
  tmdbId: z.number().int(),
  title: z.string(),
  mediaType: MediaTypeSchema,
  posterPath: z.string().nullable(),
  year: z.number().int().nullable(),
});

export type MediaType = z.infer<typeof MediaTypeSchema>;
export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
export type RatingRequest = z.infer<typeof RatingRequestSchema>;
export type ProfileUpdateRequest = z.infer<typeof ProfileUpdateRequestSchema>;
export type RecommendationItem = z.infer<typeof RecommendationItemSchema>;
export type SeedTitle = z.infer<typeof SeedTitleSchema>;
