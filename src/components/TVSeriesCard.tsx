import type { TVSeries } from '../types'
import { Card, CardMedia, CardContent, Typography, CardActions, Button } from '@mui/material'
import { Link } from 'react-router-dom'

interface TVSeriesCardProps {
  series: TVSeries
}

const TVSeriesCard = ({ series }: TVSeriesCardProps) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        image={
          series.poster_path
            ? `https://image.tmdb.org/t/p/w500${series.poster_path}`
            : '/placeholder-tv.jpg'
        }
        alt={series.name}
        sx={{ height: 300, objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div">
          {series.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          First aired: {series.first_air_date}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {series.overview.substring(0, 100)}...
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          component={Link}
          to={`/tv/${series.id}`}
          size="small"
          color="primary"
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  )
}

export default TVSeriesCard