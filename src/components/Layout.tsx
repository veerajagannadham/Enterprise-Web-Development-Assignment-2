import { Outlet } from 'react-router-dom'
import { Box, AppBar, Toolbar, Typography, Button, Container, Stack } from '@mui/material'
import { Link } from 'react-router-dom'
import { Favorite } from '@mui/icons-material'

const Layout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            MovieDB
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button color="inherit" component={Link} to="/">
              Home
            </Button>
            <Button color="inherit" component={Link} to="/popular">
              Popular Movies
            </Button>
            <Button color="inherit" component={Link} to="/actors">
              Popular Actors
            </Button>
            <Button color="inherit" component={Link} to="/tv">
              TV Series
            </Button>
            <Button 
              color="inherit" 
              component={Link} 
              to="/favorites"
              startIcon={<Favorite fontSize="small" />}
              sx={{ ml: 1 }}
            >
              Favorites
            </Button>
            <Button color="inherit" component={Link} to="/fantasy">
              Fantasy Movie
            </Button>
            
            {/* Auth buttons with some spacing */}
            <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
              <Button 
                variant="outlined" 
                color="inherit" 
                component={Link} 
                to="/signin"
                sx={{ 
                  borderColor: 'white',
                  '&:hover': { 
                    borderColor: 'white', 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)' 
                  } 
                }}
              >
                Sign In
              </Button>
              <Button 
                variant="contained" 
                color="secondary" 
                component={Link} 
                to="/signup"
              >
                Sign Up
              </Button>
            </Stack>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Outlet />
      </Container>
      
      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: 'grey.100' }}>
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} MovieDB - This product uses the TMDB API but is not endorsed or certified by TMDB
        </Typography>
      </Box>
    </Box>
  )
}

export default Layout