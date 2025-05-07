import axios from 'axios';
import type { Movie, Genre, ProductionCompany, Review } from '../types';

const API_BASE_URL = 'https://6tjvw0a9d6.execute-api.us-east-1.amazonaws.com/prod';
const API_KEY = import.meta.env.VITE_API_KEY || '';

// Fetch details of a single movie including reviews
export const fetchMovieDetails = async (id: number): Promise<Movie> => {
  const movieResponse = await axios.get<Movie>(`${API_BASE_URL}/movies/${id}`, {
    headers: API_KEY ? { 'x-api-key': API_KEY } : {}
  });

  const reviewsResponse = await axios.get<Review[]>(`${API_BASE_URL}/reviews`, {
    headers: API_KEY ? { 'x-api-key': API_KEY } : {}
  });

  const movie = movieResponse.data;
  const reviews = reviewsResponse.data.filter((review) => review.MovieId === id);

  return {
    ...movie,
    reviews,
  };
};

interface BaseMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
}

export const fetchAllMovies = async (page: number = 1): Promise<Movie[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/movies`, {
      params: { page },
      headers: API_KEY ? { 'x-api-key': API_KEY } : {}
    });

    const results = Array.isArray(response.data)
      ? response.data
      : response.data?.results || [];

    return results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview || 'No overview available',
      poster_path: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null,
      vote_average: typeof movie.vote_average === 'string'
        ? parseFloat(movie.vote_average)
        : movie.vote_average || 0,
      release_date: movie.release_date || '0000-00-00'
    }));
  } catch (error) {
    console.error('Error fetching movies:', error);
    return [];
  }
};

export const fetchPopularMovies = async (page: number = 1): Promise<Movie[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/movies`, {
      params: { page },
      headers: API_KEY ? { 'x-api-key': API_KEY } : {}
    });

    const results = Array.isArray(response.data)
      ? response.data
      : response.data?.results || [];

    return results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview || 'No overview available',
      poster_path: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null,
      vote_average: typeof movie.vote_average === 'string'
        ? parseFloat(movie.vote_average)
        : movie.vote_average || 0,
      release_date: movie.release_date || '0000-00-00'
    }));
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return [];
  }
};

export const createReview = async (review: {
  movieId: string;
  author: string;
  content: string;
  rating: number;
}): Promise<Review> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/reviews`, review, {
      headers: API_KEY ? { 'x-api-key': API_KEY } : {}
    });
    return response.data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const updateReview = async (
  reviewId: string,
  updatedData: { content?: string; rating?: number }
): Promise<Review> => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/reviews/${reviewId}`,
      updatedData,
      {
        headers: API_KEY ? { 'x-api-key': API_KEY } : {}
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating review ${reviewId}:`, error);
    throw error;
  }
};

export const getTranslatedReview = async (
  reviewId: string,
  movieId: string,
  language: string
): Promise<{ translatedText: string }> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/reviews/${reviewId}/${movieId}/translation`,
      {
        params: { language },
        headers: API_KEY ? { 'x-api-key': API_KEY } : {}
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting translated review:', error);
    throw error;
  }
};
