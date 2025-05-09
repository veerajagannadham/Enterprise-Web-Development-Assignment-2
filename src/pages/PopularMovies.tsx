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
  MenuItem,
  Pagination
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

// Number of movies to display per page (client-side pagination)
const MOVIES_PER_PAGE = 8;

export default function PopularMovies() {
  const [backendPage, setBackendPage] = useState(1);
  const [clientPage, setClientPage] = useState(1);
  const [sortOption, setSortOption] = useState('rating-desc'); // Default sort: highest rating
  
  // This query fetches all movies from the API at once
  const { data: allMovies = [], isLoading, isError, error } = useQuery({
    queryKey: ['popularMovies', backendPage],
    queryFn: () => fetchPopularMovies(backendPage),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortOption(event.target.value);
    setClientPage(1); // Reset to first page when sorting changes
  };

  // Sort movies based on the selected option
  const sortedMovies = useMemo(() => {
    if (!allMovies || allMovies.length === 0) return [];
    
    const moviesCopy = [...allMovies];
    
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
  }, [allMovies, sortOption]);

  // Client-side pagination logic
  const paginatedMovies = useMemo(() => {
    const startIndex = (clientPage - 1) * MOVIES_PER_PAGE;
    return sortedMovies.slice(startIndex, startIndex + MOVIES_PER_PAGE);
  }, [sortedMovies, clientPage]);

  // Calculate total pages
  const totalPages = Math.ceil(sortedMovies.length / MOVIES_PER_PAGE);

  // Handle page change
  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setClientPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load more movies from backend if we're running low
  const needMoreMovies = useMemo(() => {
    // If we have fewer than 2 pages worth of movies or 
    // if we're on the last page, try to fetch more
    return allMovies.length < MOVIES_PER_PAGE * 2 || 
           clientPage === totalPages;
  }, [allMovies.length, clientPage, totalPages]);

  // Effect to fetch more movies if needed
  useMemo(() => {
    if (needMoreMovies && !isLoading && !isError) {
      setBackendPage(prev => prev + 1);
    }
  }, [needMoreMovies, isLoading, isError]);

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

      {isLoading && allMovies.length === 0 && (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error instanceof Error ? error.message : 'An error occurred'}
        </Alert>
      )}

      {paginatedMovies && paginatedMovies.length > 0 ? (
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
            {paginatedMovies.map((movie: Movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </Box>

          {/* Pagination controls */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
            <Pagination 
              count={totalPages} 
              page={clientPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
          
          {/* Loading indicator for fetching more movies */}
          {isLoading && allMovies.length > 0 && (
            <Box display="flex" justifyContent="center" mt={2}>
              <CircularProgress size={24} />
              <Typography variant="body2" sx={{ ml: 1 }}>
                Loading more movies...
              </Typography>
            </Box>
          )}
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