import type { SeedTitle } from "../schemas.js";

// Curated 20-title onboarding list — mix of well-known movies, TV, and anime
// covering diverse genres so ratings give Claude signal across multiple taste axes
export const SEED_TITLES: SeedTitle[] = [
  { tmdbId: 238, title: "The Godfather", mediaType: "movie", posterPath: null, year: 1972 },
  { tmdbId: 278, title: "The Shawshank Redemption", mediaType: "movie", posterPath: null, year: 1994 },
  { tmdbId: 19404, title: "Dilwale Dulhania Le Jayenge", mediaType: "movie", posterPath: null, year: 1995 },
  { tmdbId: 155, title: "The Dark Knight", mediaType: "movie", posterPath: null, year: 2008 },
  { tmdbId: 680, title: "Pulp Fiction", mediaType: "movie", posterPath: null, year: 1994 },
  { tmdbId: 13, title: "Forrest Gump", mediaType: "movie", posterPath: null, year: 1994 },
  { tmdbId: 11216, title: "Cinema Paradiso", mediaType: "movie", posterPath: null, year: 1988 },
  { tmdbId: 372058, title: "Your Name", mediaType: "anime", posterPath: null, year: 2016 },
  { tmdbId: 129, title: "Spirited Away", mediaType: "anime", posterPath: null, year: 2001 },
  { tmdbId: 37854, title: "One Piece", mediaType: "anime", posterPath: null, year: 1999 },
  { tmdbId: 1396, title: "Breaking Bad", mediaType: "tv", posterPath: null, year: 2008 },
  { tmdbId: 66732, title: "Stranger Things", mediaType: "tv", posterPath: null, year: 2016 },
  { tmdbId: 1399, title: "Game of Thrones", mediaType: "tv", posterPath: null, year: 2011 },
  { tmdbId: 1418, title: "The Big Bang Theory", mediaType: "tv", posterPath: null, year: 2007 },
  { tmdbId: 76479, title: "The Boys", mediaType: "tv", posterPath: null, year: 2019 },
  { tmdbId: 496243, title: "Parasite", mediaType: "movie", posterPath: null, year: 2019 },
  { tmdbId: 324857, title: "Spider-Man: Into the Spider-Verse", mediaType: "movie", posterPath: null, year: 2018 },
  { tmdbId: 550, title: "Fight Club", mediaType: "movie", posterPath: null, year: 1999 },
  { tmdbId: 12477, title: "Grave of the Fireflies", mediaType: "anime", posterPath: null, year: 1988 },
  { tmdbId: 94997, title: "House of the Dragon", mediaType: "tv", posterPath: null, year: 2022 },
];
