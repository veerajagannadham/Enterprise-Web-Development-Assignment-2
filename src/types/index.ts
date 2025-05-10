/* Core Media Interfaces */
export interface MediaBase {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  vote_average: number;
  backdrop_path?: string | null;
  vote_count?: number;
  popularity?: number;
}

/* Fantasy Movie Types */
export interface CreateFantasyMovieInput {
  title: string;
  overview: string;
  genres: string[]; // Genre names or ids depending on your form
  releaseDate: string; // Should accept flexible input like "2025-01-01"
  runtime?: number;
  productionCompanies: string[]; // Names, not IDs
}

export type FantasyMovieInput = CreateFantasyMovieInput;

export interface FantasyMovie extends MediaBase {
  title: string;
  overview: string;
  genres: Genre[];
  release_date: `${number}-${number}-${number}`;
  runtime?: number;
  production_companies: ProductionCompany[];
  isFantasy: true;
  created_at: string;
  created_by?: string;
}

/* TMDB Standard Types */
export interface Movie extends MediaBase {
  original_title?: string;
  release_date: `${number}-${number}-${number}`;
  runtime?: number | null;
  genres?: Genre[];
  production_companies?: ProductionCompany[];
  reviews?: Review[];
  original_language?: string;
  video?: boolean;
  adult?: boolean;
  cast?: Cast[];
  crew?: Crew[];
  videos?: Video[];
  images?: {
    backdrops: Image[];
    posters: Image[];
    logos: Image[];
  };
}

export interface TVSeries extends MediaBase {
  name: string;
  original_name?: string;
  first_air_date: `${number}-${number}-${number}`;
  number_of_seasons: number;
  number_of_episodes: number;
  episode_run_time?: number[];
  genres?: Genre[];
  production_companies?: ProductionCompany[];
  networks?: Network[];
  seasons?: Season[];
}

/* Supporting Types */
export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country?: string;
}

export interface Network {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface CreateReviewInput {
  movieId: number;
  reviewerId: string;
  content: string;
}

export interface CreateReviewResponse {
  message: string;
  reviewId: number;
}

export interface Review {
  id: number;
  MovieId: number;
  author: string;
  content: string;
  created_at: string;
  rating?: number;
}

export interface TranslatedReview {
  translatedText: string;
  originalLanguage: string;
  translatedLanguage: string;
}

export interface Cast {
  adult: boolean;
  gender: number | null;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  cast_id: number;
  character: string;
  credit_id: string;
  order: number;
}

export interface Crew {
  adult: boolean;
  gender: number | null;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  credit_id: string;
  department: string;
  job: string;
}

export interface Video {
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
  id: string;
}

export interface Image {
  aspect_ratio: number;
  height: number;
  iso_639_1: string | null;
  file_path: string;
  vote_average: number;
  vote_count: number;
  width: number;
}

export interface Season {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

export interface BasicMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  release_date: string;
  adult: boolean;
  video: boolean;
  genre_ids: number[];
  isFantasy?: boolean;
}

export interface Actor {
  id: number;
  name: string;
  biography: string;
  profile_path: string | null;
  known_for_department: string;
  birthday: `${number}-${number}-${number}` | null;
  place_of_birth: string | null;
  also_known_as?: string[];
  gender?: number;
  popularity?: number;
}

// Add these to your existing types
export interface UpdateReviewInput {
  content: string;
}

export interface UpdateReviewResponse {
  message: string;
  updatedReview: Review;
}

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
  status_message?: string;
}

/* Authentication Types */
export interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

export interface SignUpResponse {
  message: string;
  userId: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface User {
  userId: string;
  name: string;
  email: string;
}

export interface SignInResponse {
  message: string;
  user: User;
}