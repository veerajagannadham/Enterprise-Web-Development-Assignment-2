// api/tmdb.ts
import type { MediaItem, ActorItem } from '../types';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export const getTVDetails = async (id: number): Promise<MediaItem> => {
  const response = await fetch(
    `${BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&language=en-US`
  );
  if (!response.ok) throw new Error('Failed to fetch TV show details');
  return await response.json();
};

export const getPersonDetails = async (id: number): Promise<ActorItem> => {
  const response = await fetch(
    `${BASE_URL}/person/${id}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=combined_credits`
  );
  if (!response.ok) throw new Error('Failed to fetch person details');
  return await response.json();
};

// Add these to your existing TMDB API functions
export const fetchPopularTVShows = async (page = 1): Promise<MediaItem[]> => {
  const response = await fetch(
    `https://api.themoviedb.org/3/tv/popular?api_key=${import.meta.env.VITE_TMDB_API_KEY}&page=${page}`
  );
  const data = await response.json();
  return data.results;
};

export const fetchPopularActors = async (page = 1): Promise<ActorItem[]> => {
  const response = await fetch(
    `https://api.themoviedb.org/3/person/popular?api_key=${import.meta.env.VITE_TMDB_API_KEY}&page=${page}`
  );
  const data = await response.json();
  return data.results;
};