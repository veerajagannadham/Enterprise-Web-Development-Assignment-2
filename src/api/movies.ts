import axios from 'axios'
import type { Movie, Review } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// Movie endpoints
export const fetchAllMovies = async (): Promise<Movie[]> => {
  const response = await axios.get(`${API_BASE_URL}/movies`)
  return response.data
}

export const fetchMovieById = async (id: string): Promise<Movie> => {
  const response = await axios.get(`${API_BASE_URL}/movies/${id}`)
  return response.data
}

export const fetchMovieDetails = async (id: number): Promise<Movie> => {
  const response = await axios.get(`${API_BASE_URL}/movies/${id}`)
  return response.data
}

export const fetchPopularMovies = async (): Promise<Movie[]> => {
  const response = await axios.get(`${API_BASE_URL}/movies/popular`)
  return response.data
}

// Review endpoints
export const createReview = async (review: {
  movieId: string
  author: string
  content: string
  rating: number
}): Promise<Review> => {
  const response = await axios.post(`${API_BASE_URL}/movies/reviews`, review)
  return response.data
}

export const updateReview = async (
  reviewId: string,
  updatedData: { content?: string; rating?: number }
): Promise<Review> => {
  const response = await axios.put(
    `${API_BASE_URL}/movies/reviews/${reviewId}`,
    updatedData
  )
  return response.data
}

export const getTranslatedReview = async (
  reviewId: string,
  movieId: string,
  language: string
): Promise<{ translatedText: string }> => {
  const response = await axios.get(
    `${API_BASE_URL}/movies/reviews/${reviewId}/${movieId}?language=${language}`
  )
  return response.data
}