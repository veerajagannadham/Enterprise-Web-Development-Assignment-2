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
  Pagination,
  Stack
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useState, useMemo, useEffect } from 'react';
import MovieCard from '../components/MovieCard';
import type { Movie } from '../types';

const GENRES = [
  { id: 'all', name: 'All Genres' },
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 18, name: 'Drama' },
  { id: 878, name: 'Science Fiction' },
  { id: 10751, name: 'Family' },
];

const SORT_OPTIONS = [
  { value: 'title-asc', label: 'Title (A-Z)' },
  { value: 'title-desc', label: 'Title (Z-A)' },
  { value: 'rating-desc', label: 'Rating (High to Low)' },
  { value: 'rating-asc', label: 'Rating (Low to High)' },
  { value: 'release-desc', label: 'Release Date (Newest First)' },
  { value: 'release-asc', label: 'Release Date (Oldest First)' },
];

const MOVIES_PER_PAGE = 8;

export default function PopularMovies() {
  const [backendPage, setBackendPage] = useState(1);
  const [clientPage, setClientPage] = useState(1);
  const [sortOption, setSortOption] = useState('rating-desc');
  const [genreFilter, setGenreFilter] = useState<number | 'all'>('all');
  const [allMovies, setAllMovies] = useState<Movie[]>([]);

  const { data: newMovies = [], isLoading, isError, error } = useQuery({
    queryKey: ['popularMovies', backendPage],
    queryFn: () => fetchPopularMovies(backendPage),
    staleTime: 5 * 60 * 1000,
  });

  // Accumulate movies as we load more pages
  useEffect(() => {
    if (newMovies.length > 0) {
      setAllMovies(prev => {
        // Avoid duplicates by checking movie IDs
        const existingIds = new Set(prev.map(movie => movie.id));
        const uniqueNewMovies = newMovies.filter(movie => !existingIds.has(movie.id));
        return [...prev, ...uniqueNewMovies];
      });
    }
  }, [newMovies]);

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortOption(event.target.value);
    setClientPage(1);
  };

  const handleGenreChange = (event: SelectChangeEvent<number | 'all'>) => {
    const value = event.target.value === 'all' ? 'all' : Number(event.target.value);
    setGenreFilter(value);
    setClientPage(1);
  };

  // Apply both sorting and filtering at once
// Updated filtering logic in the processedMovies useMemo
const processedMovies = useMemo(() => {
  if (!allMovies || allMovies.length === 0) return [];
  
  // Make a copy to avoid mutating the original data
  let moviesCopy = [...allMovies];
  
  // Step 1: Apply genre filter if selected
  // Genre filtering
  
  if (genreFilter !== 'all') {
    moviesCopy = moviesCopy.filter(movie => {
      // For BasicMovie type with genre_ids
      if ('genre_ids' in movie && Array.isArray(movie.genre_ids)) {
        return movie.genre_ids.includes(genreFilter as number);
      }
      // For Movie type with genres array
      if ('genres' in movie && Array.isArray(movie.genres)) {
        return movie.genres.some(g => g.id === genreFilter);
      }
      return false;
    });
  }
   
    // Step 2: Apply sorting
    switch (sortOption) {
      case 'title-asc':
        return moviesCopy.sort((a, b) => a.title.localeCompare(b.title));
      case 'title-desc':
        return moviesCopy.sort((a, b) => b.title.localeCompare(a.title));
      case 'rating-desc':
        return moviesCopy.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
      case 'rating-asc':
        return moviesCopy.sort((a, b) => (a.vote_average || 0) - (b.vote_average || 0));
      case 'release-desc':
        return moviesCopy.sort((a, b) => 
          (new Date(b.release_date || 0).getTime()) - (new Date(a.release_date || 0).getTime()
        ));
      case 'release-asc':
        return moviesCopy.sort((a, b) =>
          (new Date(a.release_date || 0).getTime()) - (new Date(b.release_date || 0).getTime())
        );
      default:
        return moviesCopy;
    }
  }, [allMovies, genreFilter, sortOption]);

  const paginatedMovies = useMemo(() => {
    const startIndex = (clientPage - 1) * MOVIES_PER_PAGE;
    return processedMovies.slice(startIndex, startIndex + MOVIES_PER_PAGE);
  }, [processedMovies, clientPage]);

  const totalPages = Math.max(1, Math.ceil(processedMovies.length / MOVIES_PER_PAGE));

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setClientPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load more data when we're near the end of current data
  useEffect(() => {
    if (
      !isLoading && 
      processedMovies.length > 0 &&
      clientPage >= totalPages - 1 &&
      allMovies.length < 100 // Prevent infinite loading
    ) {
      setBackendPage(prev => prev + 1);
    }
  }, [clientPage, totalPages, isLoading, processedMovies.length, allMovies.length]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2
      }}>
        <Typography variant="h4">
          Popular Movies
        </Typography>

        <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          {/* Genre filter dropdown */}
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel id="genre-filter-label">Filter by Genre</InputLabel>
            <Select
              labelId="genre-filter-label"
              id="genre-filter"
              value={genreFilter}
              label="Filter by Genre"
              onChange={handleGenreChange}
            >
              {GENRES.map((genre) => (
                <MenuItem key={genre.id} value={genre.id}>
                  {genre.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Sorting dropdown */}
          <FormControl sx={{ minWidth: 200 }} size="small">
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
        </Stack>
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
        {paginatedMovies.length > 0 ? (
          paginatedMovies.map((movie: Movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))
        ) : (
          !isLoading && (
            <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 4 }}>
              <Typography variant="h6">
                {genreFilter === 'all' 
                  ? 'No movies available' 
                  : `No movies found for this genre. Try a different filter.`}
              </Typography>
            </Box>
          )
        )}
      </Box>

      {/* Pagination controls - only show if we have more than one page */}
      {totalPages > 1 && (
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
      )}
      
      {/* Loading indicator for fetching more movies */}
      {isLoading && allMovies.length > 0 && (
        <Box display="flex" justifyContent="center" mt={2}>
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ ml: 1 }}>
            Loading more movies...
          </Typography>
        </Box>
      )}
    </Box>
  );
}