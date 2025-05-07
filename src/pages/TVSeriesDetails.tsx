import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchTVSeriesDetails } from '../api/TVSeries';
import { 
  Box, 
  Typography, 
  Chip, 
  CircularProgress, 
  Alert, 
  Stack, 
  Divider 
} from '@mui/material';
import { format } from 'date-fns';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

import type { TVSeries } from '../types';

const TVSeriesDetails = () => {
  const { id } = useParams<{ id: string }>();
  
  // Explicitly type the useQuery hook
  const { 
    data: series, 
    isLoading, 
    error 
  } = useQuery<TVSeries>({
    queryKey: ['tvSeries', id],
    queryFn: () => fetchTVSeriesDetails(id!)
  });

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">Error loading TV series details</Alert>;
  if (!series) return <Alert severity="warning">TV series not found</Alert>;

  // Type-safe helper functions
  const formatDate = (dateString: string) => {
    return dateString ? format(new Date(dateString), 'MMMM d, yyyy') : 'Unknown';
  };

  const getAverageRuntime = (runtimes?: number[]) => {
    if (!runtimes || runtimes.length === 0) return 'Unknown';
    const average = runtimes.reduce((a, b) => a + b, 0) / runtimes.length;
    return `${Math.round(average)} minutes`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        gap: 4,
        mb: 4
      }}>
        {/* Poster Column */}
        <Box sx={{ 
          flex: '0 0 300px',
          maxWidth: '100%',
          alignSelf: { xs: 'center', md: 'flex-start' }
        }}>
          <Box
            component="img"
            src={
              series.poster_path
                ? `https://image.tmdb.org/t/p/w500${series.poster_path}`
                : '/placeholder-tv.jpg'
            }
            alt={series.name}
            sx={{
              width: '100%',
              borderRadius: 2,
              boxShadow: 3
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-tv.jpg';
            }}
          />
        </Box>

        {/* Details Column */}
        <Box sx={{ flex: 1 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h3" component="h1">
                {series.name}
              </Typography>
              {series.original_name && series.original_name !== series.name && (
                <Typography variant="subtitle1" color="text.secondary">
                  Original Title: {series.original_name}
                </Typography>
              )}
            </Box>

            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: 2,
              alignItems: 'center'
            }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <StarIcon color="warning" />
                <Typography>
                  {series.vote_average.toFixed(1)} ({series.vote_count} votes)
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1}>
                <CalendarTodayIcon />
                <Typography>{formatDate(series.first_air_date)}</Typography>
              </Stack>

              {series.episode_run_time && (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AccessTimeIcon />
                  <Typography>{getAverageRuntime(series.episode_run_time)}</Typography>
                </Stack>
              )}
            </Box>

            {series.genres && series.genres.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {series.genres.map((genre) => (
                  <Chip key={genre.id} label={genre.name} variant="outlined" />
                ))}
              </Box>
            )}

            <Typography variant="body1" paragraph>
              {series.overview || 'No overview available.'}
            </Typography>

            <Divider />

            <Box sx={{ 
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4
            }}>
              <Stack spacing={0.5}>
                <Typography variant="subtitle2">Seasons</Typography>
                <Typography>{series.number_of_seasons}</Typography>
              </Stack>

              <Stack spacing={0.5}>
                <Typography variant="subtitle2">Episodes</Typography>
                <Typography>{series.number_of_episodes}</Typography>
              </Stack>

              {series.production_companies && series.production_companies.length > 0 && (
                <Box sx={{ minWidth: 200 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Production Companies
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {series.production_companies.map((company) => (
                      <Chip 
                        key={company.id} 
                        label={company.name} 
                        size="small" 
                        variant="outlined" 
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default TVSeriesDetails;