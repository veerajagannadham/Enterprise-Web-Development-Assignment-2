import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchMovieDetails } from '../api/movies'
import { Box, Typography, Chip, Divider, CircularProgress, Alert } from '@mui/material'
import ReviewsSection from '../components/ReviewsSection'
import type { Movie } from '../types' // Fixed: Changed to type-only import

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>()
  const { 
    data: movie, 
    isLoading, 
    error 
  } = useQuery<Movie>({
    queryKey: ['movie', id],
    queryFn: () => fetchMovieDetails(parseInt(id!, 10)), // Fixed: Convert string to number
  })

  if (isLoading) return <CircularProgress />
  if (error) return <Alert severity="error">Error loading movie details</Alert>
  if (!movie) return <Alert severity="warning">No movie data found</Alert>

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        <img
          src={
            movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : '/placeholder-movie.jpg'
          }
          alt={movie.title}
          style={{ width: 300, borderRadius: 8, alignSelf: 'flex-start' }}
        />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h3" gutterBottom>{movie.title}</Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
            {movie.release_date} • {movie.runtime ? `${movie.runtime} minutes` : 'Runtime not available'}
          </Typography>
          
          {movie.genres && movie.genres.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              {movie.genres.map((genre) => (
                <Chip key={genre.id} label={genre.name} />
              ))}
            </Box>
          )}
          
          <Typography variant="h6" gutterBottom>Overview</Typography>
          <Typography variant="body1" paragraph>
            {movie.overview || 'No overview available.'}
          </Typography>
          
          {'vote_average' in movie && movie.vote_average > 0 && (
            <Typography variant="body2" color="text.secondary">
              Rating: {movie.vote_average.toFixed(1)}/10
            </Typography>
          )}
        </Box>
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
      <ReviewsSection movieId={id!} />
    </Box>
  )
}

export default MovieDetails