import { z } from "zod";
export declare const ProfileGenerateResponseSchema: z.ZodObject<{
    tasteProfileText: z.ZodString;
    qdrantPointId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    tasteProfileText: string;
    qdrantPointId: string;
}, {
    tasteProfileText: string;
    qdrantPointId: string;
}>;
export declare const ProfileUpdateRequestSchema: z.ZodObject<{
    userId: z.ZodString;
    tmdbId: z.ZodNumber;
    title: z.ZodString;
    feedback: z.ZodEnum<["like", "dislike"]>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    tmdbId: number;
    title: string;
    feedback: "like" | "dislike";
}, {
    userId: string;
    tmdbId: number;
    title: string;
    feedback: "like" | "dislike";
}>;
export type ProfileGenerateResponse = z.infer<typeof ProfileGenerateResponseSchema>;
export type ProfileUpdateRequest = z.infer<typeof ProfileUpdateRequestSchema>;
