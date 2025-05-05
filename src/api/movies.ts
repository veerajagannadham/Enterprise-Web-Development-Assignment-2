import axios from 'axios';
import type { Movie } from '../types';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export interface MoviesApiResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface MovieDetailsResponse extends Movie {
  budget: number;
  genres: { id: number; name: string }[];
  homepage: string | null;
  overview: string;
  production_companies: { id: number; name: string; logo_path: string | null; origin_country: string }[];
  production_countries: { iso_3166_1: string; name: string }[];
  revenue: number;
  runtime: number | null;
  spoken_languages: { english_name: string; iso_639_1: string; name: string }[];
  status: string;
  tagline: string | null;
  vote_average: number;
  vote_count: number;
}

export const fetchPopularMovies = async (page: number = 1): Promise<MoviesApiResponse> => {
  const response = await axios.get<MoviesApiResponse>(`${BASE_URL}/movie/popular`, {
    params: {
      api_key: API_KEY,
      page,
    },
  });
  return response.data;
};

export const fetchMovieDetails = async (movieId: number): Promise<MovieDetailsResponse> => {
  const response = await axios.get<MovieDetailsResponse>(`${BASE_URL}/movie/${movieId}`, {
    params: {
      api_key: API_KEY,
      append_to_response: 'credits,videos,images',
    },
  });
  return response.data;
};