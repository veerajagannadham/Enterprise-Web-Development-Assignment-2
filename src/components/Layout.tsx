import { Outlet } from 'react-router-dom'
import { Box, AppBar, Toolbar, Typography, Button, Container } from '@mui/material'
import { Link } from 'react-router-dom'

const Layout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            MovieDB
          </Typography>
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
          <Button color="inherit" component={Link} to="/fantasy">
            Fantasy Movie
          </Button>
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