import { useQuery } from '@tanstack/react-query'
import { fetchPopularTVSeries } from '../api/TVSeries'
import TVSeriesCard from '../components/TVSeriesCard'
import { Box, Typography } from '@mui/material'

const PopularTVSeries = () => {
  const { data: series, isLoading, error } = useQuery({
    queryKey: ['popularTVSeries'],
    queryFn: fetchPopularTVSeries
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading TV series</div>

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Popular TV Series</Typography>
      
      <Box sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 3,
      }}>
        {series?.map((series) => (
          <Box 
            key={series.id} 
            sx={{
              flexBasis: {
                xs: '100%',
                sm: 'calc(50% - 12px)',
                md: 'calc(33.33% - 16px)',
                lg: 'calc(25% - 18px)'
              }
            }}
          >
            <TVSeriesCard series={series} />
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default PopularTVSeries