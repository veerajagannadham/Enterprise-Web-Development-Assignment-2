import { createBrowserRouter } from 'react-router-dom'
import Home from '../pages/Home'
import PopularMovies from '../pages/PopularMovies'
import PopularActors from '../pages/PopularActors'
import PopularTVSeries from '../pages/PopularTVSeries'
import MovieDetails from '../pages/MovieDetails'
import ActorDetails from '../pages/ActorDetails'
import TVSeriesDetails from '../pages/TVSeriesDetails'
import FantasyMovieForm from '../components/FantasyMovieForm'
import Layout from '../components/Layout'
import SignIn from '../pages/SignIn'
import SignUp from '../pages/SignUp'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'popular', element: <PopularMovies /> },
      { path: 'actors', element: <PopularActors /> },
      { path: 'tv', element: <PopularTVSeries /> },
      { path: 'fantasy', element: <FantasyMovieForm /> },
      { path: 'movie/:id', element: <MovieDetails /> },
      { path: 'actor/:id', element: <ActorDetails /> },
      { path: 'tv/:id', element: <TVSeriesDetails /> },
      { path: 'signin', element: <SignIn /> },
      { path: 'signup', element: <SignUp /> },
    ],
  },
])

export default router
