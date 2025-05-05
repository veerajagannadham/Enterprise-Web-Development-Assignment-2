import axios from 'axios'
import type { TVSeries } from '../types'

const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'

export const fetchTVSeriesDetails = async (id: string): Promise<TVSeries> => {
  const response = await axios.get(`${BASE_URL}/tv/${id}?api_key=${API_KEY}`)
  return response.data
}

export const fetchPopularTVSeries = async (): Promise<TVSeries[]> => {
  const response = await axios.get(`${BASE_URL}/tv/popular?api_key=${API_KEY}`)
  return response.data.results
}