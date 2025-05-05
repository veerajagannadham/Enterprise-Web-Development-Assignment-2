import { createBrowserRouter } from 'react-router-dom'
import Home from '../pages/Home'
import PopularMovies from '../pages/PopularMovies'
import MovieDetails from '../pages/MovieDetails'
import ActorDetails from '../pages/ActorDetails'
import TVSeriesDetails from '../pages/TVSeriesDetails'
import FantasyMovieForm from '../components/FantasyMovieForm'
import Layout from '../components/Layout'


const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'popular', element: <PopularMovies /> },
      { path: 'movie/:id', element: <MovieDetails /> },
      { path: 'actor/:id', element: <ActorDetails /> },
      { path: 'tv/:id', element: <TVSeriesDetails /> },
      // Add both route variations to handle different URLs
      { path: 'fantasy-movie', element: <FantasyMovieForm /> },
      { path: 'fantasy', element: <FantasyMovieForm /> },
    ],
  },

])

export default router