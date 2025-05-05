import type { Movie } from '../types'
import { Card, CardMedia, CardContent, Typography, CardActions, Button } from '@mui/material'
import { Link } from 'react-router-dom'

interface MovieCardProps {
  movie: Movie
}

const MovieCard = ({ movie }: MovieCardProps) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        image={
          movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : '/placeholder-movie.jpg'
        }
        alt={movie.title}
        sx={{ height: 300, objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div">
          {movie.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {movie.release_date}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {movie.overview.substring(0, 100)}...
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          component={Link}
          to={`/movie/${movie.id}`}
          size="small"
          color="primary"
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  )
}

export default MovieCard