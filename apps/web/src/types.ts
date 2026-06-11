export type MediaType = "movie" | "tv" | "anime";

export interface CreateUserRequest {
  email: string;
}

export interface UserResponse {
  userId: string;
  email: string;
}

export interface RatingRequest {
  userId: string;
  tmdbId: number;
  title: string;
  mediaType: MediaType;
  score: number;
}

export interface RatingResponse {
  id: string;
  userId: string;
  tmdbId: number;
  title: string;
  mediaType: MediaType;
  score: number;
  ratedAt: string;
}

export interface ProfileGenerateResponse {
  tasteProfileText: string;
  qdrantPointId: string;
}

export interface ProfileUpdateRequest {
  userId: string;
  tmdbId: number;
  title: string;
  feedback: "like" | "dislike";
}

export interface RecommendationItem {
  tmdbId: number;
  title: string;
  mediaType: string;
  posterPath: string | null;
  blurb: string;
  genres: string[];
}

export interface RecommendationsResponse {
  recommendations: RecommendationItem[];
}

export interface SeedTitle {
  tmdbId: number;
  title: string;
  mediaType: MediaType;
  posterPath: string | null;
  year: number | null;
}
