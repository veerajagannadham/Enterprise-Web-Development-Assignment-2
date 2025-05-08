import { useQuery } from '@tanstack/react-query';
import { fetchPopularMovies } from '../api/movies';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useState, useMemo } from 'react';
import MovieCard from '../components/MovieCard';
import type { Movie } from '../types';

// Sorting options
const SORT_OPTIONS = [
  { value: 'title-asc', label: 'Title (A-Z)' },
  { value: 'title-desc', label: 'Title (Z-A)' },
  { value: 'rating-desc', label: 'Rating (High to Low)' },
  { value: 'rating-asc', label: 'Rating (Low to High)' },
  { value: 'release-desc', label: 'Release Date (Newest First)' },
  { value: 'release-asc', label: 'Release Date (Oldest First)' },
];

export default function PopularMovies() {
  const [page, setPage] = useState(1);
  const [sortOption, setSortOption] = useState('rating-desc'); // Default sort: highest rating
  
  const { data: movies = [], isLoading, isError, error } = useQuery({
    queryKey: ['popularMovies', page],
    queryFn: () => fetchPopularMovies(page),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortOption(event.target.value);
  };

  // Sort movies based on the selected option
  const sortedMovies = useMemo(() => {
    if (!movies || movies.length === 0) return [];
    
    const moviesCopy = [...movies];
    
    switch (sortOption) {
      case 'title-asc':
        return moviesCopy.sort((a, b) => a.title.localeCompare(b.title));
      case 'title-desc':
        return moviesCopy.sort((a, b) => b.title.localeCompare(a.title));
      case 'rating-desc':
        return moviesCopy.sort((a, b) => {
          const ratingA = Number(a.vote_average) || 0;
          const ratingB = Number(b.vote_average) || 0;
          return ratingB - ratingA;
        });
      case 'rating-asc':
        return moviesCopy.sort((a, b) => {
          const ratingA = Number(a.vote_average) || 0;
          const ratingB = Number(b.vote_average) || 0;
          return ratingA - ratingB;
        });
      case 'release-desc':
        return moviesCopy.sort((a, b) => {
          const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
          const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
          return dateB - dateA;
        });
      case 'release-asc':
        return moviesCopy.sort((a, b) => {
          const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
          const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
          return dateA - dateB;
        });
      default:
        return moviesCopy;
    }
  }, [movies, sortOption]);

  // For debugging
  console.log('API response (movies):', movies);
  console.log('Current sort option:', sortOption);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h4">
          Popular Movies
        </Typography>

        {/* Sorting dropdown */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="sort-select-label">Sort By</InputLabel>
          <Select
            labelId="sort-select-label"
            id="sort-select"
            value={sortOption}
            label="Sort By"
            onChange={handleSortChange}
          >
            {SORT_OPTIONS.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

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

      {sortedMovies && sortedMovies.length > 0 ? (
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
            {sortedMovies.map((movie: Movie) => (
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