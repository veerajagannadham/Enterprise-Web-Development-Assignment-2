import { useQuery } from '@tanstack/react-query';
import { fetchPopularTVSeries } from '../api/TVSeries';
import TVSeriesCard from '../components/TVSeriesCard';
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

// Sorting options
const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'rating-desc', label: 'Rating (High to Low)' },
  { value: 'rating-asc', label: 'Rating (Low to High)' },
  { value: 'first_air_date-desc', label: 'Air Date (Newest First)' },
  { value: 'first_air_date-asc', label: 'Air Date (Oldest First)' },
];

// Number of TV series to display per page (client-side pagination)
const SERIES_PER_PAGE = 8;

const PopularTVSeries = () => {
  const [backendPage, setBackendPage] = useState(1);
  const [clientPage, setClientPage] = useState(1);
  const [sortOption, setSortOption] = useState('rating-desc'); // Default sort: highest rating
  
  // This query fetches TV series from the API
  const { data: allSeries = [], isLoading, error } = useQuery({
    queryKey: ['popularTVSeries', backendPage],
    queryFn: () => fetchPopularTVSeries(),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortOption(event.target.value);
    setClientPage(1); // Reset to first page when sorting changes
  };

  // Sort TV series based on the selected option
  const sortedSeries = useMemo(() => {
    if (!allSeries || allSeries.length === 0) return [];
    
    const seriesCopy = [...allSeries];
    
    switch (sortOption) {
      case 'name-asc':
        return seriesCopy.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return seriesCopy.sort((a, b) => b.name.localeCompare(a.name));
      case 'rating-desc':
        return seriesCopy.sort((a, b) => {
          const ratingA = Number(a.vote_average) || 0;
          const ratingB = Number(b.vote_average) || 0;
          return ratingB - ratingA;
        });
      case 'rating-asc':
        return seriesCopy.sort((a, b) => {
          const ratingA = Number(a.vote_average) || 0;
          const ratingB = Number(b.vote_average) || 0;
          return ratingA - ratingB;
        });
      case 'first_air_date-desc':
        return seriesCopy.sort((a, b) => {
          const dateA = a.first_air_date ? new Date(a.first_air_date).getTime() : 0;
          const dateB = b.first_air_date ? new Date(b.first_air_date).getTime() : 0;
          return dateB - dateA;
        });
      case 'first_air_date-asc':
        return seriesCopy.sort((a, b) => {
          const dateA = a.first_air_date ? new Date(a.first_air_date).getTime() : 0;
          const dateB = b.first_air_date ? new Date(b.first_air_date).getTime() : 0;
          return dateA - dateB;
        });
      default:
        return seriesCopy;
    }
  }, [allSeries, sortOption]);

  // Client-side pagination logic
  const paginatedSeries = useMemo(() => {
    const startIndex = (clientPage - 1) * SERIES_PER_PAGE;
    return sortedSeries.slice(startIndex, startIndex + SERIES_PER_PAGE);
  }, [sortedSeries, clientPage]);

  // Calculate total pages
  const totalPages = Math.ceil(sortedSeries.length / SERIES_PER_PAGE);

  // Handle page change
  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setClientPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load more series from backend if we're running low
  const needMoreSeries = useMemo(() => {
    // If we have fewer than 2 pages worth of series or 
    // if we're on the last page, try to fetch more
    return allSeries.length < SERIES_PER_PAGE * 2 || 
           clientPage === totalPages;
  }, [allSeries.length, clientPage, totalPages]);

  // Effect to fetch more series if needed
  useMemo(() => {
    if (needMoreSeries && !isLoading && !error) {
      setBackendPage(prev => prev + 1);
    }
  }, [needMoreSeries, isLoading, error]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h4">Popular TV Series</Typography>

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

      {isLoading && allSeries.length === 0 && (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error instanceof Error ? error.message : 'An error occurred loading TV series'}
        </Alert>
      )}

      {paginatedSeries && paginatedSeries.length > 0 ? (
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
            {paginatedSeries.map((series) => (
              <TVSeriesCard key={series.id} series={series} />
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
          
          {/* Loading indicator for fetching more series */}
          {isLoading && allSeries.length > 0 && (
            <Box display="flex" justifyContent="center" mt={2}>
              <CircularProgress size={24} />
              <Typography variant="body2" sx={{ ml: 1 }}>
                Loading more TV series...
              </Typography>
            </Box>
          )}
        </>
      ) : (
        !isLoading && !error && (
          <Typography variant="h6" align="center">
            No TV series found
          </Typography>
        )
      )}
    </Box>
  );
};

export default PopularTVSeries;