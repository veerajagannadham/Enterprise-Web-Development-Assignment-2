import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchMovieDetails, fetchSimilarMovies } from '../api/movies';
import { 
  Box, 
  Typography, 
  Chip, 
  Divider, 
  CircularProgress, 
  Alert,
  Rating,
  Paper,
  Stack,
  Button,
  Card,
  CardMedia
} from '@mui/material';
import ReviewsSection from '../components/ReviewsSection';
import type { Movie, Review } from '../types';

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { 
    data: movie, 
    isLoading, 
    error,
    isError 
  } = useQuery<Movie, Error>({
    queryKey: ['movie', id],
    queryFn: () => fetchMovieDetails(Number(id)),
    enabled: !!id && !isNaN(Number(id)),
    retry: 2, // Retry failed requests up to 2 times
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // Add query for similar movies
  const { 
    data: similarMovies = [], 
    isLoading: isLoadingSimilar 
  } = useQuery({
    queryKey: ['similarMovies', id],
    queryFn: () => fetchSimilarMovies(Number(id)),
    enabled: !!id && !isNaN(Number(id)),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress size={60} />
        <Typography variant="h6" ml={2}>Loading movie details...</Typography>
      </Box>
    );
  }

  if (isError || !movie) {
    return (
      <Box p={3} display="flex" justifyContent="center" minHeight="50vh" alignItems="center">
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          <Typography variant="h6">Error Loading Movie</Typography>
          <Typography>{error ? error.message : 'Movie not found or details unavailable'}</Typography>
          <Typography variant="body2" mt={1}>
            Please check your connection and try again, or go back to the movies list.
          </Typography>
        </Alert>
      </Box>
    );
  }

  console.log("Rendered movie:", movie); // Debug: check the movie object in the component

  // Format release date safely
  const formattedReleaseDate = movie.release_date && movie.release_date !== '0000-00-00'
    ? new Date(movie.release_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Release date not available';

  // Use the poster_path directly from the API response
  // It's already formatted with the base URL in the fetchMovieDetails function
  const posterUrl = movie.poster_path || '/placeholder-movie.jpg';
  
  // Handle all possible undefined values with fallbacks
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
          {movie.title || 'Unknown Title'}
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
              src={posterUrl}
              alt={movie.title || 'Movie poster'}
              sx={{ 
                width: '100%', 
                display: 'block',
                aspectRatio: '2/3',
                objectFit: 'cover'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite loop
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
              {movie.overview?.trim() ? movie.overview : 'No overview available.'}
            </Typography>
          </Box>

          {/* Genres */}
          {genres && genres.length > 0 && (
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
          {productionCompanies && productionCompanies.length > 0 && (
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

      {/* Similar Movies Section */}
      <Box mt={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">
            Similar Movies
          </Typography>
          {similarMovies.length > 0 && (
            <Button 
              variant="outlined"
              onClick={() => navigate(`/similar/${id}`)}
              sx={{ whiteSpace: 'nowrap' }}
            >
              View All Similar Movies
            </Button>
          )}
        </Box>
        
        {isLoadingSimilar && (
          <Box display="flex" alignItems="center">
            <CircularProgress size={24} />
            <Typography ml={2}>Loading similar movies...</Typography>
          </Box>
        )}
        
        {!isLoadingSimilar && similarMovies.length > 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              justifyContent: { xs: 'center', sm: 'flex-start' }
            }}
          >
            {similarMovies.slice(0, 4).map((movie) => (
              <Box 
                key={movie.id}
                sx={{ 
                  width: { xs: '45%', sm: '22%' },
                  minWidth: 120,
                  cursor: 'pointer',
                  '&:hover .movie-poster': {
                    transform: 'scale(1.03)',
                    boxShadow: 4
                  }
                }}
                onClick={() => navigate(`/movie/${movie.id}`)}
              >
                <Card 
                  className="movie-poster"
                  sx={{ 
                    transition: 'transform 0.2s',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <CardMedia
                    component="img"
                    image={movie.poster_path || '/placeholder-movie.jpg'}
                    alt={movie.title}
                    sx={{ aspectRatio: '2/3' }}
                  />
                </Card>
                <Box mt={1}>
                  <Typography variant="subtitle2" noWrap>
                    {movie.title}
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Rating 
                      value={(movie.vote_average ?? 0) / 2} 
                      precision={0.1} 
                      readOnly 
                      size="small"
                    />
                    <Typography variant="caption" ml={0.5}>
                      {movie.vote_average?.toFixed(1)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">
            {!isLoadingSimilar && 'No similar movies available'}
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />
      <ReviewsSection 
        movieId={Number(id)} 
        reviews={reviews}
      />
    </Box>
  );
};

export default MovieDetails;