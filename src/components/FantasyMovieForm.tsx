import { useState, useEffect } from 'react';
import { 
  Button, 
  TextField, 
  Box, 
  Chip, 
  Snackbar, 
  Alert,
  Typography,
  InputAdornment
} from '@mui/material';
import { createFantasyMovie } from '../api/movies';
import type { FantasyMovieInput } from '../types';

const FantasyMovieForm = () => {
  const [movie, setMovie] = useState<FantasyMovieInput>({
    title: '',
    overview: '',
    genres: [],
    releaseDate: '',
    productionCompanies: [],
    runtime: undefined
  });
  
  const [newGenre, setNewGenre] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' // <-- include "warning"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({
    title: false,
    overview: false,
    genres: false,
    releaseDate: false
  });

  // Validate form whenever movie state changes
  useEffect(() => {
    setFormErrors({
      title: !movie.title.trim(),
      overview: !movie.overview.trim(),
      genres: movie.genres.length === 0,
      releaseDate: !movie.releaseDate
    });
  }, [movie]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (formErrors.title || formErrors.overview || 
        formErrors.genres || formErrors.releaseDate) {
      setNotification({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Format date to YYYY-MM-DD
      const formattedDate = new Date(movie.releaseDate)
        .toISOString()
        .split('T')[0];
      
      await createFantasyMovie({
        ...movie,
        releaseDate: formattedDate,
        productionCompanies: movie.productionCompanies || [] // Ensure array exists
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
        productionCompanies: [],
        runtime: undefined
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

  const handleAddGenre = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newGenre.trim()) {
      e.preventDefault();
      const genreToAdd = newGenre.trim();
      
      if (movie.genres.includes(genreToAdd)) {
        setNotification({
          open: true,
          message: 'This genre already exists',
          severity: 'warning'
        });
      } else {
        setMovie({
          ...movie, 
          genres: [...movie.genres, genreToAdd]
        });
      }
      setNewGenre('');
    }
  };

  const handleAddCompany = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newCompany.trim()) {
      e.preventDefault();
      const companyToAdd = newCompany.trim();
      
      if (movie.productionCompanies.includes(companyToAdd)) {
        setNotification({
          open: true,
          message: 'This company already exists',
          severity: 'warning'
        });
      } else {
        setMovie({
          ...movie, 
          productionCompanies: [...(movie.productionCompanies || []), companyToAdd]
        });
      }
      setNewCompany('');
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
        label="Title *"
        fullWidth
        margin="normal"
        value={movie.title}
        onChange={(e) => setMovie({...movie, title: e.target.value})}
        error={formErrors.title}
        helperText={formErrors.title ? "Title is required" : ""}
        required
      />
      
      <TextField
        label="Overview *"
        fullWidth
        multiline
        rows={4}
        margin="normal"
        value={movie.overview}
        onChange={(e) => setMovie({...movie, overview: e.target.value})}
        error={formErrors.overview}
        helperText={formErrors.overview ? "Overview is required" : ""}
        required
      />
      
      {/* Genre input */}
      <Box sx={{ my: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Genres *
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
          error={formErrors.genres && movie.genres.length === 0}
        />
        {formErrors.genres && (
          <Typography color="error" variant="caption">
            At least one genre is required
          </Typography>
        )}
      </Box>
      
      {/* Production Companies input */}
      <Box sx={{ my: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Production Companies
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          {(movie.productionCompanies || []).map((company) => (
            <Chip 
              key={company} 
              label={company} 
              onDelete={() => 
                setMovie({
                  ...movie, 
                  productionCompanies: movie.productionCompanies?.filter(c => c !== company) || []
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
        label="Release Date *"
        type="date"
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        value={movie.releaseDate}
        onChange={(e) => setMovie({...movie, releaseDate: e.target.value})}
        error={formErrors.releaseDate}
        helperText={formErrors.releaseDate ? "Release date is required" : ""}
        required
      />
      
      <TextField
        label="Runtime (minutes)"
        type="number"
        fullWidth
        margin="normal"
        value={movie.runtime || ''}
        onChange={(e) => {
          const value = parseInt(e.target.value);
          setMovie({
            ...movie, 
            runtime: !isNaN(value) && value > 0 ? value : undefined
          });
        }}
        InputProps={{
          endAdornment: <InputAdornment position="end">min</InputAdornment>,
          inputProps: { min: 1 }
        }}
      />
      
      <Button 
        type="submit" 
        variant="contained" 
        color="primary" 
        sx={{ mt: 2 }}
        disabled={isSubmitting || Object.values(formErrors).some(Boolean)}
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