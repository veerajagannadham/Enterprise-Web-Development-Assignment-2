import { useQuery } from '@tanstack/react-query'
import { fetchPopularActors } from '../api/actors'
import ActorCard from '../components/ActorCard'
import { Box, Typography, CircularProgress, Alert } from '@mui/material'

const PopularActors = () => {
  const { 
    data: actors, 
    isLoading, 
    isError,
    error
  } = useQuery({
    queryKey: ['popularActors'],
    queryFn: fetchPopularActors,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  })

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading actors: {error?.message || 'Unknown error'}
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Popular Actors
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 3,
        justifyContent: {
          xs: 'center',
          sm: 'flex-start'
        }
      }}>
        {actors?.map((actor) => (
          <Box 
            key={actor.id} 
            sx={{ 
              width: {
                xs: '100%',
                sm: 'calc(50% - 12px)',
                md: 'calc(33.333% - 16px)',
                lg: 'calc(25% - 18px)'
              }
            }}
          >
            <ActorCard actor={actor} />
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default PopularActors