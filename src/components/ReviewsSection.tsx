import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  Divider,
  Rating,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Collapse,
  Alert,
} from '@mui/material';
import { 
  createMovieReview, 
  updateMovieReview, 
  getTranslatedReview 
} from '../api/movies';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import TranslateIcon from '@mui/icons-material/Translate';
import type { Review } from '../types';

interface ReviewsSectionProps {
  movieId: number | string;
  initialReviews: Review[];
}

// Helper to adapt reviews that might have different field formats
const adaptReview = (review: any): Review => {
  return {
    id: review.id || review.ReviewId || Date.now().toString(),
    MovieId: review.MovieId || review.movieId || 0,
    author: review.author || review.Author || review.ReviewerId || 'Anonymous',
    content: review.content || review.Content || '',
    rating: review.rating || (review.Rating !== undefined ? review.Rating : 0),
    created_at: review.created_at || review.ReviewDate || new Date().toISOString()
  };
};

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ movieId, initialReviews }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState<number | null>(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edit state
  // Edit state
  const [editingReviewId, setEditingReviewId] = useState<string | number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editRating, setEditRating] = useState<number>(0);

  // Translation state
  const [translatingReviewId, setTranslatingReviewId] = useState<string | number | null>(null);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [translationLanguage, setTranslationLanguage] = useState('es'); // Default to Spanish
  const [isTranslating, setIsTranslating] = useState(false);

  const availableLanguages = [
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
  ];

  // Process initial reviews to ensure consistent format
  useEffect(() => {
    if (initialReviews && initialReviews.length > 0) {
      const adaptedReviews = initialReviews.map(adaptReview);
      setReviews(adaptedReviews);
    }
  }, [initialReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!author || !content) {
      setError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create the review data in the format expected by the API
      const newReviewData = {
        author: author,
        content: content,
        rating: rating || 0
      };

      // Submit the review to the API
      const newReview = await createMovieReview(movieId.toString(), newReviewData);

      // Add the new review to the list
      setReviews((prev) => [...prev, adaptReview(newReview)]);
      
      // Show success message
      setSuccess('Review submitted successfully!');
      setTimeout(() => setSuccess(null), 5000);

      // Reset form
      setAuthor('');
      setContent('');
      setRating(0);
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReviewId(review.id);
    setEditContent(review.content);
    setEditRating(review.rating || 0);
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditContent('');
    setEditRating(0);
  };

  const handleSaveEdit = async (reviewId: string | number) => {
    if (!editContent) {
      setError('Review content cannot be empty.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const updatedData = {
        content: editContent,
        rating: editRating
      };

      const updatedReview = await updateMovieReview(
        movieId.toString(),
        reviewId.toString(),
        updatedData
      );

      // Update the review in the list
      setReviews(prev => 
        prev.map(r => r.id === reviewId ? { ...r, ...updatedData } : r)
      );

      setEditingReviewId(null);
      setSuccess('Review updated successfully!');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      console.error('Error updating review:', err);
      setError(err.message || 'Failed to update review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTranslate = async (reviewId: string | number) => {
    if (translatingReviewId === reviewId) {
      // If already translating this review, close it
      setTranslatingReviewId(null);
      setTranslatedContent(null);
      return;
    }

    setTranslatingReviewId(reviewId);
    setTranslatedContent(null);
    
    try {
      setIsTranslating(true);
      const result = await getTranslatedReview(
        reviewId.toString(),
        movieId.toString(),
        translationLanguage
      );
      
      setTranslatedContent(result.translatedText);
    } catch (err: any) {
      console.error('Error translating review:', err);
      setError('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <Box mt={6}>
      <Typography variant="h5" gutterBottom>
        Reviews
      </Typography>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setError(null)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 2 }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setSuccess(null)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {success}
        </Alert>
      )}

      {reviews.length === 0 ? (
        <Typography>No reviews yet. Be the first to review!</Typography>
      ) : (
        <List>
          {reviews.map((review) => (
            <React.Fragment key={review.id}>
              <ListItem alignItems="flex-start">
                <Box sx={{ width: '100%' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography fontWeight="bold">{review.author}</Typography>
                    <Box display="flex" alignItems="center">
                      {review.rating !== undefined && review.rating > 0 && (
                        <Rating 
                          value={review.rating / 2} 
                          readOnly={editingReviewId !== review.id}
                          precision={0.5}
                          onChange={(event, newValue) => {
                            setEditRating(newValue ? newValue * 2 : 0);
                          }}
                        />
                      )}
                      
                      {/* Translation button */}
                      <IconButton 
                        size="small" 
                        onClick={() => handleTranslate(review.id)}
                        color={translatingReviewId === review.id ? "primary" : "default"}
                        disabled={isTranslating}
                      >
                        <TranslateIcon />
                      </IconButton>
                      
                      {/* Edit button */}
                      {editingReviewId !== review.id ? (
                        <IconButton 
                          size="small" 
                          onClick={() => handleEdit(review)}
                        >
                          <EditIcon />
                        </IconButton>
                      ) : (
                        <>
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => handleSaveEdit(review.id)}
                            disabled={isSubmitting}
                          >
                            <SaveIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={handleCancelEdit}
                          >
                            <CloseIcon />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </Box>
                  
                  {editingReviewId === review.id ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      sx={{ my: 1 }}
                    />
                  ) : (
                    <Typography variant="body1" sx={{ mb: 1 }}>{review.content}</Typography>
                  )}
                  
                  {/* Translation section */}
                  {translatingReviewId === review.id && (
                    <Box mt={1} mb={2} sx={{ backgroundColor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
                          <InputLabel>Language</InputLabel>
                          <Select
                            value={translationLanguage}
                            label="Language"
                            size="small"
                            onChange={(e) => setTranslationLanguage(e.target.value)}
                          >
                            {availableLanguages.map(lang => (
                              <MenuItem key={lang.code} value={lang.code}>
                                {lang.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Button 
                          size="small" 
                          variant="outlined"
                          onClick={() => handleTranslate(review.id)}
                          disabled={isTranslating}
                          startIcon={isTranslating ? <CircularProgress size={16} /> : null}
                        >
                          {isTranslating ? 'Translating...' : 'Translate'}
                        </Button>
                      </Box>
                      {translatedContent && (
                        <Typography variant="body2" fontStyle="italic">
                          {translatedContent}
                        </Typography>
                      )}
                    </Box>
                  )}

                  <Typography variant="caption" color="text.secondary">
                    {review.created_at
                      ? new Date(review.created_at).toLocaleDateString()
                      : 'Invalid Date'}
                  </Typography>
                </Box>
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      )}

      <Box mt={5} component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom>
          Add Your Review
        </Typography>
        
        <TextField
          label="Your Name"
          fullWidth
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Your Review"
          fullWidth
          multiline
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <Box mb={2}>
          <Typography component="legend">Your Rating</Typography>
          <Rating
            name="rating"
            value={rating}
            onChange={(event, newValue) => {
              setRating(newValue);
            }}
          />
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          type="submit"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </Box>
    </Box>
  );
};

export default ReviewsSection;