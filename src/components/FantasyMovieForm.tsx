import { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Box,
  Chip,
  Snackbar,
  Alert,
  Typography,
  InputAdornment,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import type { FantasyMovieInput } from '../types';

const LOCAL_STORAGE_KEY = 'fantasyMovieForm';

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
    severity: 'success' as 'success' | 'error' | 'warning',
    previewData: null as FantasyMovieInput | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({
    title: false,
    overview: false,
    genres: false,
    releaseDate: false
  });

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setMovie(parsed);
      } catch (err) {
        console.error('Failed to parse local storage:', err);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(movie));
  }, [movie]);

  useEffect(() => {
    setFormErrors({
      title: !movie.title.trim(),
      overview: !movie.overview.trim(),
      genres: movie.genres.length === 0,
      releaseDate: !movie.releaseDate
    });
  }, [movie]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formErrors.title || formErrors.overview || formErrors.genres || formErrors.releaseDate) {
      setNotification({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error',
        previewData: null
      });
      return;
    }

    setIsSubmitting(true);

    const formattedDate = new Date(movie.releaseDate).toISOString().split('T')[0];
    const submittedMovie: FantasyMovieInput = {
      ...movie,
      releaseDate: formattedDate,
      productionCompanies: movie.productionCompanies || []
    };

    setNotification({
      open: true,
      message: 'Fantasy movie saved locally!',
      severity: 'success',
      previewData: submittedMovie
    });

    setMovie({
      title: '',
      overview: '',
      genres: [],
      releaseDate: '',
      productionCompanies: [],
      runtime: undefined
    });

    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setIsSubmitting(false);
  };

  const handleAddGenre = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newGenre.trim()) {
      e.preventDefault();
      const genreToAdd = newGenre.trim();

      if (movie.genres.includes(genreToAdd)) {
        setNotification({
          open: true,
          message: 'This genre already exists',
          severity: 'warning',
          previewData: null
        });
      } else {
        setMovie({ ...movie, genres: [...movie.genres, genreToAdd] });
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
          severity: 'warning',
          previewData: null
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
        onChange={(e) => setMovie({ ...movie, title: e.target.value })}
        error={formErrors.title}
        helperText={formErrors.title ? 'Title is required' : ''}
        required
      />

      <TextField
        label="Overview *"
        fullWidth
        multiline
        rows={4}
        margin="normal"
        value={movie.overview}
        onChange={(e) => setMovie({ ...movie, overview: e.target.value })}
        error={formErrors.overview}
        helperText={formErrors.overview ? 'Overview is required' : ''}
        required
      />

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
                setMovie({ ...movie, genres: movie.genres.filter((g) => g !== genre) })
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
                  productionCompanies: movie.productionCompanies?.filter((c) => c !== company) || []
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
        onChange={(e) => setMovie({ ...movie, releaseDate: e.target.value })}
        error={formErrors.releaseDate}
        helperText={formErrors.releaseDate ? 'Release date is required' : ''}
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          <Box>
            <Typography fontWeight="bold">{notification.message}</Typography>
            {notification.severity === 'success' && notification.previewData && (
              <Paper elevation={0} sx={{ mt: 2, p: 2, bgcolor: 'background.paper' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Preview of your submission:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Title" secondary={notification.previewData.title} />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemText
                      primary="Overview"
                      secondary={
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {notification.previewData.overview}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemText primary="Genres" secondary={notification.previewData.genres.join(', ')} />
                  </ListItem>
                  {notification.previewData.productionCompanies?.length > 0 && (
                    <>
                      <Divider component="li" />
                      <ListItem>
                        <ListItemText
                          primary="Production Companies"
                          secondary={notification.previewData.productionCompanies.join(', ')}
                        />
                      </ListItem>
                    </>
                  )}
                  <Divider component="li" />
                  <ListItem>
                    <ListItemText
                      primary="Release Date"
                      secondary={formatDate(notification.previewData.releaseDate)}
                    />
                  </ListItem>
                  {notification.previewData.runtime && (
                    <>
                      <Divider component="li" />
                      <ListItem>
                        <ListItemText
                          primary="Runtime"
                          secondary={`${notification.previewData.runtime} minutes`}
                        />
                      </ListItem>
                    </>
                  )}
                </List>
              </Paper>
            )}
          </Box>
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FantasyMovieForm;
