export interface MediaBase {
  id: number;
  overview: string;
  poster_path: string | null;
  vote_average: number;
  backdrop_path?: string | null;
  vote_count?: number;
  popularity?: number;
}

export interface Movie extends MediaBase {
  title: string;
  original_title?: string;
  release_date: `${number}-${number}-${number}`;
  runtime?: number | null;
  genres?: Genre[];
  production_companies?: ProductionCompany[];
  reviews?: Review[];
  isPopular?: boolean;
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

export interface FantasyMovie {
  title: string;
  overview: string;
  genres?: string[];
  releaseDate: string;
  runtime?: number;
  productionCompanies?: string[];
}

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

export interface Review {
  ReviewId: number;
  MovieId: number;
  Author: string;
  Content: string;
  Rating: number;
  CreatedAt: string;
  author_details?: {
    name: string;
    username: string;
    avatar_path: string | null;
    rating: number | null;
  };
}

export interface TranslatedReview {
  translatedText: string;
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

