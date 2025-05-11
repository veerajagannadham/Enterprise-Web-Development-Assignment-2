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
  Stack,
  TextField,
  Slider,
  Button
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
  const [allMovies, setAllMovies] = useState<Movie[]>([]);

  // Active filters
  const [filters, setFilters] = useState({
    title: '',
    genre: 'all' as number | 'all',
    year: '',
    vote: [0, 10] as [number, number],
    sort: 'rating-desc',
  });

  // Form (draft) state
  const [formValues, setFormValues] = useState({ ...filters });

  const { data: newMovies = [], isLoading, isError, error } = useQuery({
    queryKey: ['popularMovies', backendPage],
    queryFn: () => fetchPopularMovies(backendPage),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (newMovies.length > 0) {
      setAllMovies(prev => {
        const existingIds = new Set(prev.map(movie => movie.id));
        const uniqueNewMovies = newMovies.filter(movie => !existingIds.has(movie.id));
        return [...prev, ...uniqueNewMovies];
      });
    }
  }, [newMovies]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...formValues });
    setClientPage(1);
  };

  const handleReset = () => {
    const reset = {
      title: '',
      genre: 'all' as number | 'all',
      year: '',
      vote: [0, 10] as [number, number],
      sort: 'rating-desc',
    };
    setFormValues(reset);
    setFilters(reset);
    setClientPage(1);
  };

  const processedMovies = useMemo(() => {
    let moviesCopy = [...allMovies];

    if (filters.title.trim()) {
      moviesCopy = moviesCopy.filter(movie =>
        movie.title.toLowerCase().includes(filters.title.toLowerCase())
      );
    }


    if (filters.year) {
      moviesCopy = moviesCopy.filter(movie =>
        movie.release_date?.startsWith(filters.year)
      );
    }

    moviesCopy = moviesCopy.filter(movie =>
      movie.vote_average >= filters.vote[0] && movie.vote_average <= filters.vote[1]
    );

    switch (filters.sort) {
      case 'title-asc':
        return moviesCopy.sort((a, b) => a.title.localeCompare(b.title));
      case 'title-desc':
        return moviesCopy.sort((a, b) => b.title.localeCompare(a.title));
      case 'rating-desc':
        return moviesCopy.sort((a, b) => b.vote_average - a.vote_average);
      case 'rating-asc':
        return moviesCopy.sort((a, b) => a.vote_average - b.vote_average);
      case 'release-desc':
        return moviesCopy.sort((a, b) =>
          new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
        );
      case 'release-asc':
        return moviesCopy.sort((a, b) =>
          new Date(a.release_date).getTime() - new Date(b.release_date).getTime()
        );
      default:
        return moviesCopy;
    }
  }, [allMovies, filters]);

  const paginatedMovies = useMemo(() => {
    const start = (clientPage - 1) * MOVIES_PER_PAGE;
    return processedMovies.slice(start, start + MOVIES_PER_PAGE);
  }, [processedMovies, clientPage]);

  const totalPages = Math.max(1, Math.ceil(processedMovies.length / MOVIES_PER_PAGE));

  useEffect(() => {
    if (
      !isLoading &&
      processedMovies.length > 0 &&
      clientPage >= totalPages - 1 &&
      allMovies.length < 100
    ) {
      setBackendPage(prev => prev + 1);
    }
  }, [clientPage, totalPages, isLoading, processedMovies.length, allMovies.length]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" mb={2}>Popular Movies</Typography>

      <form onSubmit={handleFormSubmit}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ flexWrap: 'wrap', alignItems: 'center', mb: 2 }}
        >
          <TextField
            size="small"
            label="Search Title"
            value={formValues.title}
            onChange={e => setFormValues({ ...formValues, title: e.target.value })}
          />

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Genre</InputLabel>
            <Select
              value={formValues.genre}
              label="Genre"
              onChange={(e) => {
                const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                setFormValues({ ...formValues, genre: val });
              }}
            >
              {GENRES.map(g => (
                <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={formValues.sort}
              label="Sort By"
              onChange={e => setFormValues({ ...formValues, sort: e.target.value })}
            >
              {SORT_OPTIONS.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Release Year</InputLabel>
            <Select
              value={formValues.year}
              label="Release Year"
              onChange={e => setFormValues({ ...formValues, year: e.target.value })}
            >
              <MenuItem value="">All Years</MenuItem>
              <MenuItem value="2023">2023</MenuItem>
              <MenuItem value="2022">2022</MenuItem>
              <MenuItem value="2021">2021</MenuItem>
              <MenuItem value="2020">2020</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ minWidth: 200, px: 2 }}>
            <Typography variant="caption">
              Rating Range: {formValues.vote[0]} – {formValues.vote[1]}
            </Typography>
            <Slider
              value={formValues.vote}
              onChange={(_, val) => setFormValues({ ...formValues, vote: val as [number, number] })}
              min={0}
              max={10}
              step={0.1}
              valueLabelDisplay="auto"
            />
          </Box>

          <Stack direction="row" spacing={1} sx={{ mt: { xs: 1, sm: 0 } }}>
            <Button type="submit" variant="contained">Search</Button>
            <Button type="button" variant="outlined" onClick={handleReset}>Reset</Button>
          </Stack>
        </Stack>
      </form>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error instanceof Error ? error.message : 'An error occurred'}
        </Alert>
      )}

      {isLoading && allMovies.length === 0 ? (
        <Box display="flex" justifyContent="center"><CircularProgress /></Box>
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)'
              },
              gap: 3,
              mb: 4
            }}
          >
            {paginatedMovies.length > 0 ? (
              paginatedMovies.map((movie: Movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))
            ) : (
              <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 4 }}>
                <Typography variant="h6">
                  No movies match the selected filters.
                </Typography>
              </Box>
            )}
          </Box>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={clientPage}
                onChange={(_, val) => setClientPage(val)}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      {isLoading && allMovies.length > 0 && (
        <Box display="flex" justifyContent="center" mt={2}>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          <Typography variant="body2">Loading more movies...</Typography>
        </Box>
      )}
    </Box>
  );
}
