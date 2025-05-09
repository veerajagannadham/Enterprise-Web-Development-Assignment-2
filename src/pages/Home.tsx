import { Box, Typography, Button, Container, Paper, Grid } from '@mui/material'
import { Link } from 'react-router-dom'
import MovieIcon from '@mui/icons-material/Movie'
import TvIcon from '@mui/icons-material/Tv'
import PeopleIcon from '@mui/icons-material/People'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'

const Home = () => {
  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 4, md: 8 }, 
          textAlign: 'center',
          borderRadius: 2,
          background: 'linear-gradient(135deg, #2c3e50 0%, #4c669f 100%)',
          color: 'white',
          mb: 6,
          mt: 2
        }}
      >
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 700, 
            textShadow: '0px 2px 4px rgba(0,0,0,0.3)',
            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' }
          }}
        >
          Welcome to MovieDB
        </Typography>
        
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 4,
            maxWidth: '800px',
            mx: 'auto',
            opacity: 0.9,
            fontWeight: 300
          }}
        >
          Your ultimate destination to discover amazing movies, TV shows, and talented actors
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Button
            component={Link}
            to="/popular"
            variant="contained"
            size="large"
            sx={{ 
              px: 4, 
              py: 1.5,
              backgroundColor: '#e50914',
              '&:hover': {
                backgroundColor: '#b2070f',
              },
              fontWeight: 'bold',
              borderRadius: '30px'
            }}
            startIcon={<MovieIcon />}
          >
            Browse Popular Movies
          </Button>
          
          <Button
            component={Link}
            to="/fantasy"
            variant="outlined"
            size="large"
            sx={{ 
              px: 4, 
              py: 1.5,
              borderColor: 'white',
              color: 'white',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
              fontWeight: 'bold',
              borderRadius: '30px'
            }}
            startIcon={<AutoFixHighIcon />}
          >
            Create Fantasy Movie
          </Button>
        </Box>
      </Paper>


    </Container>
  )
}

export default Home