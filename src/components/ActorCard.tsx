import type { Actor } from '../types'
import { Card, CardMedia, CardContent, Typography, CardActions, Button } from '@mui/material'
import { Link } from 'react-router-dom'

interface ActorCardProps {
  actor: Actor
}

const ActorCard = ({ actor }: ActorCardProps) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        image={
          actor.profile_path
            ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
            : '/placeholder-actor.jpg'
        }
        alt={actor.name}
        sx={{ height: 300, objectFit: 'cover' }}
      />
      <CardContent>
        <Typography gutterBottom variant="h6" component="div">
          {actor.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {actor.known_for_department}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          component={Link}
          to={`/actor/${actor.id}`}
          size="small"
          color="primary"
        >
          View Profile
        </Button>
      </CardActions>
    </Card>
  )
}

export default ActorCard