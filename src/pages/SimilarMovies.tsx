import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchSimilarMovies } from '../api/movies';
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
  CardMedia,
  CardContent,
  useTheme,
  useMediaQuery
} from '@mui/material';
import type { Movie } from '../types';

const SimilarMovies = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const { 
    data: similarMovies, 
    isLoading, 
    error,
    isError 
  } = useQuery<Movie[], Error>({
    queryKey: ['similarMovies', movieId],
    queryFn: () => fetchSimilarMovies(Number(movieId)),
    enabled: !!movieId && !isNaN(Number(movieId)),
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress size={60} />
        <Typography variant="h6" ml={2}>Loading similar movies...</Typography>
      </Box>
    );
  }

  if (isError || !similarMovies) {
    return (
      <Box p={3} display="flex" justifyContent="center" minHeight="50vh" alignItems="center">
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          <Typography variant="h6">Error Loading Similar Movies</Typography>
          <Typography>{error ? error.message : 'Similar movies not available'}</Typography>
          <Typography variant="body2" mt={1}>
            Please check your connection and try again, or go back to the movie details.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Calculate card width based on screen size
  const getCardWidth = () => {
    if (isSmallScreen) return '100%';
    if (isMediumScreen) return '48%';
    return '23%';
  };

  return (
    <Box sx={{ 
      maxWidth: 1200, 
      mx: 'auto', 
      p: { xs: 2, md: 4 },
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }}>
      {/* Header with back button */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h3" component="h1">
          Similar Movies
        </Typography>
        <Button 
          variant="outlined" 
          onClick={() => navigate(-1)}
          sx={{ alignSelf: 'flex-start' }}
        >
          Back to Movie
        </Button>
      </Box>

      <Divider />

      {/* Similar Movies Container */}
      {similarMovies.length > 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
            justifyContent: isSmallScreen ? 'center' : 'flex-start'
          }}
        >
          {similarMovies.map((movie) => (
            <Card 
              key={movie.id}
              sx={{ 
                width: getCardWidth(),
                minWidth: 200,
                flexGrow: 1,
                maxWidth: 300,
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.03)',
                  boxShadow: 6
                }
              }}
              onClick={() => navigate(`/movie/${movie.id}`)}
            >
              <CardMedia
                component="img"
                image={movie.poster_path || '/placeholder-movie.jpg'}
                alt={movie.title}
                sx={{
                  aspectRatio: '2/3',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/placeholder-movie.jpg';
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="div" noWrap>
                  {movie.title}
                </Typography>
                <Box display="flex" alignItems="center" mb={1}>
                  <Rating 
                    value={(movie.vote_average ?? 0) / 2} 
                    precision={0.1} 
                    readOnly 
                    size="small"
                  />
                  <Typography variant="body2" color="text.secondary" ml={1}>
                    {movie.vote_average?.toFixed(1)}
                  </Typography>
                </Box>
                {movie.release_date && movie.release_date !== '0000-00-00' && (
                  <Typography variant="body2" color="text.secondary">
                    {new Date(movie.release_date).getFullYear()}
                  </Typography>
                )}
                {movie.genres && movie.genres.length > 0 && (
                  <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                    {movie.genres.slice(0, 3).map((genre) => (
                      <Chip 
                        key={genre.id} 
                        label={genre.name} 
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">No similar movies found</Typography>
          <Typography color="text.secondary" mt={2}>
            We couldn't find any similar movies for this title.
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 3 }}
            onClick={() => navigate(-1)}
          >
            Back to Movie
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default SimilarMovies;