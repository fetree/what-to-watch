import { z } from "zod";
export declare const RecommendationItemSchema: z.ZodObject<{
    tmdbId: z.ZodNumber;
    title: z.ZodString;
    mediaType: z.ZodString;
    posterPath: z.ZodNullable<z.ZodString>;
    blurb: z.ZodString;
    genres: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    tmdbId: number;
    title: string;
    mediaType: string;
    posterPath: string | null;
    blurb: string;
    genres: string[];
}, {
    tmdbId: number;
    title: string;
    mediaType: string;
    posterPath: string | null;
    blurb: string;
    genres: string[];
}>;
export declare const RecommendationsResponseSchema: z.ZodObject<{
    recommendations: z.ZodArray<z.ZodObject<{
        tmdbId: z.ZodNumber;
        title: z.ZodString;
        mediaType: z.ZodString;
        posterPath: z.ZodNullable<z.ZodString>;
        blurb: z.ZodString;
        genres: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        tmdbId: number;
        title: string;
        mediaType: string;
        posterPath: string | null;
        blurb: string;
        genres: string[];
    }, {
        tmdbId: number;
        title: string;
        mediaType: string;
        posterPath: string | null;
        blurb: string;
        genres: string[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    recommendations: {
        tmdbId: number;
        title: string;
        mediaType: string;
        posterPath: string | null;
        blurb: string;
        genres: string[];
    }[];
}, {
    recommendations: {
        tmdbId: number;
        title: string;
        mediaType: string;
        posterPath: string | null;
        blurb: string;
        genres: string[];
    }[];
}>;
export declare const SeedTitleSchema: z.ZodObject<{
    tmdbId: z.ZodNumber;
    title: z.ZodString;
    mediaType: z.ZodEnum<["movie", "tv", "anime"]>;
    posterPath: z.ZodNullable<z.ZodString>;
    year: z.ZodNullable<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    tmdbId: number;
    title: string;
    mediaType: "movie" | "tv" | "anime";
    posterPath: string | null;
    year: number | null;
}, {
    tmdbId: number;
    title: string;
    mediaType: "movie" | "tv" | "anime";
    posterPath: string | null;
    year: number | null;
}>;
export type RecommendationItem = z.infer<typeof RecommendationItemSchema>;
export type RecommendationsResponse = z.infer<typeof RecommendationsResponseSchema>;
export type SeedTitle = z.infer<typeof SeedTitleSchema>;
