import { useQuery } from '@tanstack/react-query';
import { fetchPopularMovies } from '../api/movies';
import { Box, Typography, Pagination, CircularProgress, Alert } from '@mui/material';
import { useState } from 'react';
import MovieCard from '../components/MovieCard';
import type { Movie } from '../types';

export default function PopularMovies() {
  const [page, setPage] = useState(1);
  
  const { data: movies = [], isLoading, isError, error } = useQuery({
    queryKey: ['popularMovies', page],
    queryFn: () => fetchPopularMovies(page),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // For debugging
  console.log('API response (movies):', movies);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Popular Movies
      </Typography>

      {isLoading && (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error instanceof Error ? error.message : 'An error occurred'}
        </Alert>
      )}

      {movies && movies.length > 0 ? (
        <>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)'
            },
            gap: 3,
            mb: 4
          }}>
            {movies.map((movie: Movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </Box>

          {/* Since we're not getting pagination info from the API,
              we're not showing pagination controls */}
        </>
      ) : (
        !isLoading && !isError && (
          <Typography variant="h6" align="center">
            No movies found
          </Typography>
        )
      )}
    </Box>
  );
}