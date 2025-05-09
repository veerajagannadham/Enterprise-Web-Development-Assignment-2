import axios, {AxiosError} from 'axios';
import type { Movie, Genre, ProductionCompany, CreateReviewInput, Review, CreateReviewResponse, FantasyMovie, FantasyMovieInput, UpdateReviewInput, UpdateReviewResponse, ApiErrorResponse } from '../types';

const API_BASE_URL = 'https://vb9rdedn26.execute-api.us-east-1.amazonaws.com/prod';
// Removed API_KEY since it's not needed
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const isValidDateString = (dateStr: string): dateStr is `${number}-${number}-${number}` => {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
};


// Helper function to normalize movie data from different sources
const normalizeMovieData = (data: any, source: 'api' | 'tmdb' = 'api'): Movie => {
  // Common normalization for both sources
  const baseMovie = {
    id: data.id || undefined,
    title: data.title || data.original_title || 'Unknown Title',
    overview: data.overview || 'No overview available.',
    poster_path: data.poster_path 
      ? (data.poster_path.startsWith('http') 
          ? data.poster_path 
          : `https://image.tmdb.org/t/p/w500${data.poster_path}`)
      : null,
    vote_average: data.vote_average ?? 0,
    backdrop_path: data.backdrop_path 
      ? (data.backdrop_path.startsWith('http') 
          ? data.backdrop_path 
          : `https://image.tmdb.org/t/p/original${data.backdrop_path}`)
      : null,
    vote_count: data.vote_count ?? 0,
    popularity: data.popularity ?? 0,
    release_date: data.release_date || '0000-00-00',
    runtime: data.runtime ?? null,
    original_language: data.original_language ?? 'en',
    video: data.video ?? false,
    adult: data.adult ?? false,
  };

  // Source-specific normalization
  if (source === 'api') {
    return {
      ...baseMovie,
      genres: data.genres?.map((g: any) => ({ id: g.id, name: g.name })) || [],
      production_companies: data.production_companies?.map((pc: any) => ({
        id: pc.id,
        name: pc.name,
        logo_path: pc.logo_path,
        origin_country: pc.origin_country
      })) || [],
      cast: data.cast || [],
      crew: data.crew || [],
      videos: data.videos || [],
      images: data.images || { backdrops: [], posters: [], logos: [] },
      reviews: data.reviews || []
    };
  } else { // TMDB
    return {
      ...baseMovie,
      genres: data.genres || [],
      production_companies: data.production_companies || [],
      cast: data.credits?.cast || [],
      crew: data.credits?.crew || [],
      videos: data.videos?.results || [],
      images: {
        backdrops: data.images?.backdrops || [],
        posters: data.images?.posters || [],
        logos: data.images?.logos || []
      },
      reviews: data.reviews?.results || []
    };
  }
};

// Fallback to TMDB API if primary API fails
const fetchFromTMDB = async (id: number): Promise<Movie> => {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB API key not configured');
  }

  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
      params: {
        api_key: TMDB_API_KEY,
        append_to_response: 'credits,videos,images,reviews'
      }
    });
    return normalizeMovieData(response.data, 'tmdb');
  } catch (error) {
    console.error(`TMDB fallback failed for movie ${id}:`, error);
    throw error;
  }
};

export const fetchMovieDetails = async (id: number): Promise<Movie> => {
  try {
    // Attempt primary API first
    const response = await axios.get(`${API_BASE_URL}/movies/${id}`);
    
    // Handle different response structures
    let movieData = response.data;
    if (movieData.movie) {
      movieData = movieData.movie;
    }
    if (movieData.results && movieData.results.length > 0) {
      movieData = movieData.results[0];
    }

    // Validate we got at least some basic movie data
    if (!movieData || (!movieData.id && !movieData.title)) {
      throw new Error('Invalid movie data structure from primary API');
    }

    // Normalize and return the data
    return normalizeMovieData(movieData);
  } catch (primaryError) {
    console.error(`Primary API failed for movie ${id}:`, primaryError);
    
    // Attempt TMDB fallback
    try {
      console.log('Attempting TMDB fallback...');
      const tmdbMovie = await fetchFromTMDB(id);
      return tmdbMovie;
    } catch (fallbackError) {
      console.error(`All data sources failed for movie ${id}`);
      
      // Return a minimal valid movie object to prevent crashes
      return normalizeMovieData({});
    }
  }
};

// Utility to merge your reviews with TMDB ones (if key is set)
const getMergedReviews = async (id: number, existingReviews: Review[]): Promise<Review[]> => {
  if (!TMDB_API_KEY) return existingReviews;

  try {
    const tmdbResponse = await axios.get(`${TMDB_BASE_URL}/movie/${id}/reviews`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        page: 1
      }
    });

    const tmdbReviews: Review[] = tmdbResponse.data.results.map((r: any) => ({
      id: r.id,
      MovieId: id,
      author: r.author,
      content: r.content,
      rating: r.author_details?.rating ?? 0,
      created_at: r.created_at
    }));

    // Combine and return
    return [...existingReviews, ...tmdbReviews];
  } catch (err) {
    console.error(`Error fetching TMDB reviews for movie ${id}:`, err);
    return existingReviews;
  }
};

export const fetchAllMovies = async (page: number = 1): Promise<Movie[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/movies`, {
      params: { page }
    });

    const results = Array.isArray(response.data)
      ? response.data
      : response.data?.results || [];

    return results.map((movie: any) => ({
      id: movie.id,
      title: movie.title || movie.original_title || 'Unknown Title',
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
      params: { page }
    });

    const results = Array.isArray(response.data)
      ? response.data
      : response.data?.results || [];

    return results.map((movie: any) => ({
      id: movie.id,
      title: movie.title || movie.original_title || 'Unknown Title',
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

// movies.ts (frontend)


// In movies.ts, update the createMovieReview function:

export async function createMovieReview(
  reviewData: CreateReviewInput
): Promise<CreateReviewResponse> {
  try {
    const response = await axios.post<CreateReviewResponse>(
      `${API_BASE_URL}/movies/reviews`,
      {
        movieId: Number(reviewData.movieId),
        reviewerId: reviewData.reviewerId,
        content: reviewData.content
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    // Properly type the error response
    const axiosError = error as AxiosError<{
      message?: string;
      error?: string;
    }>;
    
    // Log detailed error information
    console.error('API Error Details:', {
      status: axiosError.response?.status,
      data: axiosError.response?.data,
      headers: axiosError.response?.headers
    });

    // Provide a user-friendly error message
    const errorMessage = 
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to create review. Please try again later.';

    throw new Error(errorMessage);
  }
}

export const updateMovieReview = async (
  movieId: number,
  reviewId: number,
  updateData: UpdateReviewInput
): Promise<UpdateReviewResponse> => {
  try {
    const response = await axios.put<UpdateReviewResponse>(
      `${API_BASE_URL}/movies/${movieId}/reviews/${reviewId}`,
      updateData,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    // Validate response structure
    if (!response.data.message || !response.data.updatedReview) {
      throw new Error('Invalid response structure from server');
    }

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    
    console.error('Update Review Error:', {
      status: axiosError.response?.status,
      data: axiosError.response?.data,
      config: axiosError.config
    });

    const errorMessage = (
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to update review'
    );

    throw new Error(errorMessage);
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
        params: { language }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting translated review:', error);
    throw error;
  }
};

export const createFantasyMovie = async (
  input: FantasyMovieInput
): Promise<FantasyMovie> => {
  try {
    // Validate required fields
    if (!input.title || !input.overview || !input.genres || !input.releaseDate) {
      throw new Error('Missing required fields: title, overview, genres, or releaseDate');
    }

    // Validate date format
    if (!isValidDateString(input.releaseDate)) {
      throw new Error('Invalid date format. Please use YYYY-MM-DD');
    }

    // Format payload to exactly match backend expectations
    const payload = {
      title: input.title,
      overview: input.overview,
      genres: input.genres, // Already an array of strings
      releaseDate: input.releaseDate, // Note: camelCase vs release_date
      productionCompanies: input.productionCompanies || [], // Ensure array
      runtime: input.runtime ? Number(input.runtime) : undefined // Optional number
    };

    const response = await axios.post<{ 
      message: string; 
      movieId: string 
    }>(
      `${API_BASE_URL}/fantasy/movies`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Return a complete fantasy movie object that matches the FantasyMovie interface
    return {
      id: Number(response.data.movieId), // Convert string to number
      title: input.title,
      overview: input.overview,
      poster_path: null,
      backdrop_path: null,
      vote_average: 0,
      vote_count: 0,
      popularity: 0,
      // Create proper Genre objects with required id property
      genres: input.genres.map((name, index) => ({ 
        id: index + 1, // Generate temporary IDs
        name 
      })),
      release_date: input.releaseDate as `${number}-${number}-${number}`,
      // Create proper ProductionCompany objects with required fields
      production_companies: input.productionCompanies?.map((name, index) => ({ 
        id: index + 1, // Generate temporary IDs
        name,
        logo_path: null,
        origin_country: 'unknown'
      })) || [],
      // Use undefined instead of null for runtime if not provided
      runtime: input.runtime || undefined,
      isFantasy: true,
      // Add the required created_at field
      created_at: new Date().toISOString()
    };
  } catch (error) {
    const axiosError = error as AxiosError<{ 
      message?: string;
      error?: string;
    }>;
    
    console.error('Error creating fantasy movie:', {
      status: axiosError.response?.status,
      data: axiosError.response?.data,
      config: axiosError.config
    });

    const errorMessage = (
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to create fantasy movie'
    );

    throw new Error(errorMessage);
  }
};

export const deleteMovieReview = async (
  movieId: number,
  reviewId: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/movies/${movieId}/reviews/${reviewId}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Handle different successful response structures
    if (response.status === 204) {
      return { success: true, message: 'Review deleted successfully' };
    }

    if (response.data?.message) {
      return { success: true, message: response.data.message };
    }

    return { success: true, message: 'Review deleted' };
    
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    
    console.error('Delete Review Error:', {
      status: axiosError.response?.status,
      data: axiosError.response?.data,
      config: axiosError.config
    });

    const errorMessage = (
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to delete review'
    );

    throw new Error(errorMessage);
  }
};