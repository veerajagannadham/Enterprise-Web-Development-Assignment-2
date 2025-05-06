import { useQuery } from '@tanstack/react-query'
import { fetchPopularActors } from '../api/actors'
import ActorCard from '../components/ActorCard'
import { Box, Typography } from '@mui/material'

const PopularActors = () => {
  const { data: actors, isLoading, error } = useQuery({
    queryKey: ['popularActors'],
    queryFn: fetchPopularActors
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading actors</div>

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Popular Actors</Typography>
      <Box 
        sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          margin: -1.5 // Compensate for padding in child boxes
        }}
      >
        {actors?.map((actor) => (
          <Box 
            key={actor.id} 
            sx={{ 
              width: {
                xs: '100%',
                sm: '50%',
                md: '33.333%',
                lg: '25%'
              },
              padding: 1.5
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