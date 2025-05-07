import { useState } from 'react';
import { 
  Button, 
  TextField, 
  Box, 
  Chip, 
  Snackbar, 
  Alert,
  Typography
} from '@mui/material';
import { createFantasyMovie } from '../api/movies';
import type { FantasyMovieInput } from '../types';

const FantasyMovieForm = () => {
  const [movie, setMovie] = useState<FantasyMovieInput>({
    title: '',
    overview: '',
    genres: [],
    releaseDate: '',
    productionCompanies: []
  });
  
  const [newGenre, setNewGenre] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Format date to YYYY-MM-DD before submission
      const formattedDate = formatFormDate(movie.releaseDate);
      await createFantasyMovie({
        ...movie,
        releaseDate: formattedDate
      });
      
      setNotification({
        open: true,
        message: 'Fantasy movie created successfully!',
        severity: 'success'
      });
      
      // Reset form
      setMovie({
        title: '',
        overview: '',
        genres: [],
        releaseDate: '',
        productionCompanies: []
      });
    } catch (error) {
      setNotification({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to create fantasy movie',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to format date from various input formats to YYYY-MM-DD
  const formatFormDate = (dateString: string): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Fallback to raw input
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  const handleAddGenre = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newGenre) {
      e.preventDefault();
      if (!movie.genres.includes(newGenre)) {
        setMovie({
          ...movie, 
          genres: [...movie.genres, newGenre]
        });
        setNewGenre('');
      }
    }
  };

  const handleAddCompany = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newCompany) {
      e.preventDefault();
      if (!movie.productionCompanies.includes(newCompany)) {
        setMovie({
          ...movie, 
          productionCompanies: [...movie.productionCompanies, newCompany]
        });
        setNewCompany('');
      }
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h4" gutterBottom>
        Create Fantasy Movie
      </Typography>
      
      <TextField
        label="Title"
        fullWidth
        margin="normal"
        value={movie.title}
        onChange={(e) => setMovie({...movie, title: e.target.value})}
        required
      />
      
      <TextField
        label="Overview"
        fullWidth
        multiline
        rows={4}
        margin="normal"
        value={movie.overview}
        onChange={(e) => setMovie({...movie, overview: e.target.value})}
        required
      />
      
      {/* Genre input */}
      <Box sx={{ my: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Genres
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          {movie.genres.map((genre) => (
            <Chip 
              key={genre} 
              label={genre} 
              onDelete={() => 
                setMovie({
                  ...movie, 
                  genres: movie.genres.filter(g => g !== genre)
                })
              } 
            />
          ))}
        </Box>
        <TextField
          label="Add Genre"
          value={newGenre}
          onChange={(e) => setNewGenre(e.target.value)}
          onKeyDown={handleAddGenre}
          margin="normal"
          helperText="Press Enter to add genre"
        />
      </Box>
      
      {/* Production Companies input */}
      <Box sx={{ my: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Production Companies
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          {movie.productionCompanies.map((company) => (
            <Chip 
              key={company} 
              label={company} 
              onDelete={() => 
                setMovie({
                  ...movie, 
                  productionCompanies: movie.productionCompanies.filter(c => c !== company)
                })
              } 
            />
          ))}
        </Box>
        <TextField
          label="Add Production Company"
          value={newCompany}
          onChange={(e) => setNewCompany(e.target.value)}
          onKeyDown={handleAddCompany}
          margin="normal"
          helperText="Press Enter to add company"
        />
      </Box>
      
      <TextField
        label="Release Date"
        type="date"
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        value={movie.releaseDate}
        onChange={(e) => setMovie({...movie, releaseDate: e.target.value})}
        required
      />
      
      <TextField
        label="Runtime (minutes)"
        type="number"
        fullWidth
        margin="normal"
        value={movie.runtime || ''}
        onChange={(e) => setMovie({
          ...movie, 
          runtime: e.target.value ? parseInt(e.target.value) : undefined
        })}
      />
      
      <Button 
        type="submit" 
        variant="contained" 
        color="primary" 
        sx={{ mt: 2 }}
        disabled={isSubmitting}
        fullWidth
      >
        {isSubmitting ? 'Creating...' : 'Create Fantasy Movie'}
      </Button>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FantasyMovieForm;