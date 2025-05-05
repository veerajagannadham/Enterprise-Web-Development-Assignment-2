import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchTVSeriesDetails } from '../api/TVSeries'
import { Box, Typography, Chip, CircularProgress, Alert } from '@mui/material'

const TVSeriesDetails = () => {
  const { id } = useParams<{ id: string }>()
  const { data: series, isLoading, error } = useQuery(['tvSeries', id], () => fetchTVSeriesDetails(id!))

  if (isLoading) return <CircularProgress />
  if (error) return <Alert severity="error">Error loading TV series details</Alert>

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
        <img
          src={
            series?.poster_path
              ? `https://image.tmdb.org/t/p/w500${series.poster_path}`
              : '/placeholder-tv.jpg'
          }
          alt={series?.name}
          style={{ width: 300, borderRadius: 8 }}
        />
        <Box>
          <Typography variant="h3">{series?.name}</Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
            First aired: {series?.first_air_date} • {series?.number_of_seasons} seasons • {series?.number_of_episodes} episodes
          </Typography>
          <Typography variant="body1" paragraph>
            {series?.overview}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default TVSeriesDetails