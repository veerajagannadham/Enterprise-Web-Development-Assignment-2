export interface MediaBase {
    id: number
    overview: string
    poster_path: string | null
    vote_average: number
  }
  
  export interface Movie extends MediaBase {
    title: string
    release_date: `${number}-${number}-${number}`
    runtime?: number | null
    genres?: Genre[]
    production_companies?: ProductionCompany[]
  }
  
  export interface Actor {
    id: number
    name: string
    biography: string
    profile_path: string | null
    known_for_department: string
    birthday: `${number}-${number}-${number}` | null
    place_of_birth: string | null
  }
  
  export interface TVSeries extends MediaBase {
    name: string
    first_air_date: `${number}-${number}-${number}`
    number_of_seasons: number
    number_of_episodes: number
  }
  
  export interface FantasyMovie {
    title: string
    overview: string
    genres?: string[]
    releaseDate: string
    runtime?: number
    productionCompanies?: string[]
  }
  
  export interface Genre {
    id: number
    name: string
  }
  
  export interface ProductionCompany {
    id: number
    name: string
    logo_path: string | null
  }