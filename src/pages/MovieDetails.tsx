import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchMovieDetails } from '../api/movies'
import { Box, Typography, Chip, Divider, CircularProgress, Alert } from '@mui/material'
import ReviewsSection from '../components/ReviewsSection'

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>()
  const { data: movie, isLoading, error } = useQuery(['movie', id], () => fetchMovieDetails(id!))

  if (isLoading) return <CircularProgress />
  if (error) return <Alert severity="error">Error loading movie details</Alert>

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
        <img
          src={
            movie?.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : '/placeholder-movie.jpg'
          }
          alt={movie?.title}
          style={{ width: 300, borderRadius: 8 }}
        />
        <Box>
          <Typography variant="h3">{movie?.title}</Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
            {movie?.release_date} • {movie?.runtime} minutes
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {movie?.genres?.map((genre) => (
              <Chip key={genre.id} label={genre.name} />
            ))}
          </Box>
          <Typography variant="body1" paragraph>
            {movie?.overview}
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ my: 3 }} />
      <ReviewsSection movieId={id!} />
    </Box>
  )
}

export default MovieDetails