import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchActorDetails } from '../api/actors'
import { Box, Typography, CircularProgress, Alert } from '@mui/material'

const ActorDetails = () => {
  const { id } = useParams<{ id: string }>()
  
  const { data: actor, isLoading, error } = useQuery({
    queryKey: ['actor', id],
    queryFn: () => fetchActorDetails(id!),
  })

  if (isLoading) return <CircularProgress />
  if (error) return <Alert severity="error">Error loading actor details</Alert>

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
        <img
          src={
            actor?.profile_path
              ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
              : '/placeholder-actor.jpg'
          }
          alt={actor?.name}
          style={{ width: 300, borderRadius: 8 }}
        />
        <Box>
          <Typography variant="h3">{actor?.name}</Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
            {actor?.birthday} • {actor?.place_of_birth}
          </Typography>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Biography
          </Typography>
          <Typography variant="body1" paragraph>
            {actor?.biography || 'No biography available.'}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default ActorDetails