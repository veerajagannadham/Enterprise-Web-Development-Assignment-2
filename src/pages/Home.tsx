import { Box, Typography, Button } from '@mui/material'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h3" gutterBottom>
        Welcome to MovieDB
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Discover movies, TV shows, and actors
      </Typography>
      <Button
        component={Link}
        to="/popular"
        variant="contained"
        size="large"
        sx={{ mr: 2 }}
      >
        Browse Popular Movies
      </Button>
      <Button
        component={Link}
        to="/fantasy"
        variant="outlined"
        size="large"
      >
        Create Fantasy Movie
      </Button>
    </Box>
  )
}

export default Home