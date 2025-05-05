import axios from 'axios'
import type { Actor } from '../types'

const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'

export const fetchActorDetails = async (id: string): Promise<Actor> => {
  const response = await axios.get(`${BASE_URL}/person/${id}?api_key=${API_KEY}`)
  return response.data
}

export const fetchPopularActors = async (): Promise<Actor[]> => {
  const response = await axios.get(`${BASE_URL}/person/popular?api_key=${API_KEY}`)
  return response.data.results
}