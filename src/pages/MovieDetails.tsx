import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchMovieDetails } from '../api/movies';
import { 
  Box, 
  Typography, 
  Chip, 
  Divider, 
  CircularProgress, 
  Alert,
  Rating,
  Paper,
  Stack
} from '@mui/material';
import ReviewsSection from '../components/ReviewsSection';
import type { Movie, Review } from '../types';

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  
  const { 
    data: movie, 
    isLoading, 
    error,
    isError 
  } = useQuery<Movie, Error>({
    queryKey: ['movie', id],
    queryFn: () => fetchMovieDetails(Number(id)),
    enabled: !!id && !isNaN(Number(id))
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isError || !movie) {
    return (
      <Box p={3}>
        <Alert severity="error">
          {error ? error.message : 'Movie not found'}
        </Alert>
      </Box>
    );
  }

  const formattedReleaseDate = movie.release_date !== '0000-00-00'
    ? new Date(movie.release_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Release date not available';

  // Handle all possible undefined values with fallbacks
  const posterSrc = movie.poster_path 
  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
  : '/placeholder-movie.jpg';
;
  const voteAverage = movie.vote_average ?? 0;
  const voteCount = movie.vote_count ?? 0;
  const genres = movie.genres ?? [];
  const productionCompanies = movie.production_companies ?? [];
  const reviews = movie.reviews ?? [];
  const runtime = movie.runtime ?? 0;

  return (
    <Box sx={{ 
      maxWidth: 1200, 
      mx: 'auto', 
      p: { xs: 2, md: 4 },
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }}>
      {/* Movie Header */}
      <Box>
        <Typography variant="h3" component="h1" gutterBottom>
          {movie.title}
          {movie.original_title && movie.original_title !== movie.title && (
            <Typography variant="subtitle1" color="text.secondary">
              Original Title: {movie.original_title}
            </Typography>
          )}
        </Typography>
      </Box>

      {/* Main Content */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 4,
        alignItems: 'flex-start'
      }}>
        {/* Left Column - Poster and Rating */}
        <Box sx={{
          width: { xs: '100%', md: '300px' },
          flexShrink: 0
        }}>
          <Paper elevation={3} sx={{ 
            borderRadius: 2, 
            overflow: 'hidden', 
            mb: 2 
          }}>
            <Box
              component="img"
              src={posterSrc}
              alt={movie.title}
              sx={{ 
                width: '100%', 
                display: 'block',
                aspectRatio: '2/3',
                objectFit: 'cover'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-movie.jpg';
              }}
            />
          </Paper>

          <Paper elevation={2} sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={1}>
              <Rating 
                value={voteAverage / 2} 
                precision={0.1} 
                readOnly 
                size="large"
              />
              <Box ml={1.5}>
                <Typography variant="h6">
                  {voteAverage.toFixed(1)}
                  <Typography component="span" color="text.secondary">
                    /10
                  </Typography>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {voteCount.toLocaleString()} votes
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Details
              </Typography>
              <Typography>
                <strong>Release Date:</strong> {formattedReleaseDate}
              </Typography>
              {runtime > 0 && (
                <Typography>
                  <strong>Runtime:</strong> {Math.floor(runtime / 60)}h {runtime % 60}m
                </Typography>
              )}
              <Typography>
                <strong>Language:</strong> {(movie.original_language || 'en').toUpperCase()}
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* Right Column - Details */}
        <Box sx={{ flex: 1 }}>
          {/* Overview */}
          <Box mb={4}>
            <Typography variant="h5" gutterBottom>
              Overview
            </Typography>
            <Typography paragraph>
              {movie.overview || 'No overview available.'}
            </Typography>
          </Box>

          {/* Genres */}
          {genres.length > 0 && (
            <Box mb={4}>
              <Typography variant="h5" gutterBottom>
                Genres
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {genres.map((genre) => (
                  <Chip 
                    key={genre.id} 
                    label={genre.name} 
                    color="primary"
                    size="medium"
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Production Companies */}
          {productionCompanies.length > 0 && (
            <Box mb={4}>
              <Typography variant="h5" gutterBottom>
                Production Companies
              </Typography>
              <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
                {productionCompanies.map((company) => (
                  <Paper key={company.id} sx={{ 
                    p: 2, 
                    minWidth: 120,
                    textAlign: 'center',
                    flexShrink: 0
                  }}>
                    <Typography variant="body1">
                      {company.name}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Reviews Section */}
      <ReviewsSection 
        movieId={id || ''} 
        initialReviews={reviews} 
      />
    </Box>
  );
};

export default MovieDetails;