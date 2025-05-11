import axios, { AxiosError } from 'axios';
import type {
  Movie,
  Genre,
  ProductionCompany,
  CreateReviewInput,
  Review,
  CreateReviewResponse,
  FantasyMovie,
  FantasyMovieInput,
  UpdateReviewInput,
  UpdateReviewResponse,
  ApiErrorResponse,
  SignUpInput,
  SignUpResponse,
  SignInInput,
  SignInResponse
} from '../types';

const API_BASE_URL = 'https://vb9rdedn26.execute-api.us-east-1.amazonaws.com/prod';
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const isValidDateString = (dateStr: string): dateStr is `${number}-${number}-${number}` => {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
};

const normalizeMovieData = (data: any, source: 'api' | 'tmdb' = 'api'): Movie => {
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
  } else {
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
    const response = await axios.get(`${API_BASE_URL}/movies/${id}`);
    let movieData = response.data;
    if (movieData.movie) movieData = movieData.movie;
    if (movieData.results?.length > 0) movieData = movieData.results[0];
    if (!movieData || (!movieData.id && !movieData.title)) {
      throw new Error('Invalid movie data structure from primary API');
    }
    return normalizeMovieData(movieData);
  } catch (primaryError) {
    console.error(`Primary API failed for movie ${id}:`, primaryError);
    try {
      return await fetchFromTMDB(id);
    } catch {
      return normalizeMovieData({});
    }
  }
};

export const fetchAllMovies = async (page: number = 1): Promise<Movie[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/movies`, { params: { page } });
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
    const response = await axios.get(`${API_BASE_URL}/movies`, { params: { page } });
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

// //Storybook Support
// export const fetchPopularMovies = async (page = 1) => {
//   const { movies } = await import('../data/movies');
//   return movies.slice((page - 1) * 8, page * 8); // simulate pagination
// };


export const signUp = async (userData: SignUpInput): Promise<SignUpResponse> => {
  try {
    const response = await axios.post<SignUpResponse>(
      `${API_BASE_URL}/auth/signup`,
      userData,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 8000
      }
    );
    if (response.status >= 400) throw new Error(response.data?.message || 'Registration failed');
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    let message = 'Failed to create account.';
    if (axiosError.response) {
      message = axiosError.response.data.message || axiosError.response.data.error || message;
    } else if (axiosError.code === 'ECONNABORTED') {
      message = 'Request timeout.';
    }
    throw new Error(message);
  }
};

export const signIn = async (credentials: SignInInput): Promise<SignInResponse> => {
  try {
    const response = await axios.post<SignInResponse>(
      `${API_BASE_URL}/auth/signin`,
      credentials,
      { headers: { 'Content-Type': 'application/json' } }
    );
    if (response.data.user) localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    if (axiosError.response?.status === 401) throw new Error('Invalid email or password');
    if (axiosError.response?.status === 404) throw new Error('Account not found');
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to sign in.'
    );
  }
};

export const signOut = (): void => {
  localStorage.removeItem('user');
};

export const getCurrentUser = (): SignInResponse['user'] | null => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

export async function createMovieReview(reviewData: CreateReviewInput): Promise<CreateReviewResponse> {
  try {
    const response = await axios.post<CreateReviewResponse>(
      `${API_BASE_URL}/movies/reviews`,
      {
        movieId: Number(reviewData.movieId),
        reviewerId: reviewData.reviewerId,
        content: reviewData.content
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    const message =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to create review.';
    throw new Error(message);
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
      { headers: { 'Content-Type': 'application/json' } }
    );
    if (!response.data.updatedReview) throw new Error('Invalid update response');
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to update review.'
    );
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
      { params: { language } }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting translated review:', error);
    throw error;
  }
};

export const createFantasyMovie = async (input: FantasyMovieInput): Promise<FantasyMovie> => {
  try {
    if (!input.title || !input.overview || !input.genres || !input.releaseDate) {
      throw new Error('Missing required fields.');
    }
    if (!isValidDateString(input.releaseDate)) {
      throw new Error('Invalid date format.');
    }

    const payload = {
      title: input.title,
      overview: input.overview,
      genres: input.genres,
      releaseDate: input.releaseDate,
      productionCompanies: input.productionCompanies || [],
      runtime: input.runtime ? Number(input.runtime) : undefined
    };

    const response = await axios.post<{ message: string; movieId: string }>(
      `${API_BASE_URL}/fantasy/movies`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );

    return {
      id: Number(response.data.movieId),
      title: input.title,
      overview: input.overview,
      poster_path: null,
      backdrop_path: null,
      vote_average: 0,
      vote_count: 0,
      popularity: 0,
      genres: input.genres.map((name, i) => ({ id: i + 1, name })),
      release_date: input.releaseDate,
      production_companies: input.productionCompanies?.map((name, i) => ({
        id: i + 1,
        name,
        logo_path: null,
        origin_country: 'unknown'
      })) || [],
      runtime: input.runtime || undefined,
      isFantasy: true,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to create fantasy movie.'
    );
  }
};

export const deleteMovieReview = async (
  movieId: number,
  reviewId: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/movies/${movieId}/reviews/${reviewId}`,
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (response.status === 204) {
      return { success: true, message: 'Review deleted successfully' };
    }

    return {
      success: true,
      message: response.data?.message || 'Review deleted'
    };
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to delete review.'
    );
  }
};

export const fetchSimilarMovies = async (movieId: number, page = 1): Promise<Movie[]> => {
  if (!TMDB_API_KEY) {
    console.warn('TMDB API key not configured - similar movies feature disabled');
    return [];
  }

  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}/similar`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        page,
        append_to_response: 'credits,videos,images'
      }
    });

    return response.data.results.map((movie: any) => normalizeMovieData(movie, 'tmdb'));
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    console.error('Error fetching similar movies:', {
      movieId,
      status: axiosError.response?.status,
      data: axiosError.response?.data
    });

    throw new Error(
      axiosError.response?.data?.status_message ||
      axiosError.message ||
      'Failed to fetch similar movies.'
    );
  }
};

/**
 * Upload a poster image for a movie.
 * @param movieId - ID of the movie.
 * @param file - Poster image file.
 */
export const uploadMoviePoster = async (movieId: number, file: File): Promise<{ message: string }> => {
  const formData = new FormData();
  formData.append('movieId', movieId.toString());
  formData.append('poster', file);

  try {
    const response = await axios.post(`${API_BASE_URL}/upload/poster`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to upload poster.'
    );
  }
};

/**
 * Upload cast details for a movie.
 * @param movieId - ID of the movie.
 * @param castJsonFile - JSON file containing cast array.
 */
export const uploadMovieCast = async (movieId: number, castJsonFile: File): Promise<{ message: string }> => {
  const formData = new FormData();
  formData.append('movieId', movieId.toString());
  formData.append('cast', castJsonFile);

  try {
    const response = await axios.post(`${API_BASE_URL}/upload/cast`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Failed to upload cast.'
    );
  }
};