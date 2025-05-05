import { useQuery } from '@tanstack/react-query';
import { fetchPopularMovies, type MoviesApiResponse } from '../api/movies';
import { Box, Typography, Pagination, CircularProgress, Alert } from '@mui/material';
import { useState } from 'react';
import MovieCard from '../components/MovieCard';

export default function PopularMovies() {
  const [page, setPage] = useState(1);
  
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['popularMovies', page],
    queryFn: () => fetchPopularMovies(page),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Type guard to ensure data has the expected structure
  const hasValidData = (data: unknown): data is MoviesApiResponse => {
    return !!data && typeof data === 'object' && 
           'results' in data && 
           'total_pages' in data;
  };

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
          {error.message}
        </Alert>
      )}

      {hasValidData(data) && data.results.length > 0 ? (
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
            {data.results.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </Box>

          <Box display="flex" justifyContent="center">
            <Pagination
              count={data.total_pages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
              sx={{ mt: 4 }}
            />
          </Box>
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