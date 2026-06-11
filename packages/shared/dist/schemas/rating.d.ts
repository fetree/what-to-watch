import { z } from "zod";
export declare const MediaTypeSchema: z.ZodEnum<["movie", "tv", "anime"]>;
export declare const RatingRequestSchema: z.ZodObject<{
    userId: z.ZodString;
    tmdbId: z.ZodNumber;
    title: z.ZodString;
    mediaType: z.ZodEnum<["movie", "tv", "anime"]>;
    score: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    userId: string;
    tmdbId: number;
    title: string;
    mediaType: "movie" | "tv" | "anime";
    score: number;
}, {
    userId: string;
    tmdbId: number;
    title: string;
    mediaType: "movie" | "tv" | "anime";
    score: number;
}>;
export declare const RatingResponseSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    tmdbId: z.ZodNumber;
    title: z.ZodString;
    mediaType: z.ZodEnum<["movie", "tv", "anime"]>;
    score: z.ZodNumber;
    ratedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    userId: string;
    tmdbId: number;
    title: string;
    mediaType: "movie" | "tv" | "anime";
    score: number;
    id: string;
    ratedAt: string;
}, {
    userId: string;
    tmdbId: number;
    title: string;
    mediaType: "movie" | "tv" | "anime";
    score: number;
    id: string;
    ratedAt: string;
}>;
export type MediaType = z.infer<typeof MediaTypeSchema>;
export type RatingRequest = z.infer<typeof RatingRequestSchema>;
export type RatingResponse = z.infer<typeof RatingResponseSchema>;
