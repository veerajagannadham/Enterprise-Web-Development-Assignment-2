import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  Divider,
  Rating,
} from '@mui/material';
import { createReview } from '../api/movies';
import type { Review } from '../types';

interface ReviewsSectionProps {
  movieId: number;
  initialReviews: Review[];
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ movieId, initialReviews }) => {
  const [reviews, setReviews] = useState<Review[]>(initialReviews || []);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!author || !content || rating == null) {
      setError('Please fill in all fields and select a rating.');
      return;
    }

    try {
      const newReview = await createReview({
        movieId: movieId.toString(),
        author,
        content,
        rating,
      });

      setReviews((prev) => [...prev, newReview]);

      // Reset form
      setAuthor('');
      setContent('');
      setRating(null);
      setError(null);
    } catch (err: any) {
      setError('Failed to submit review. Please try again.');
    }
  };

  return (
    <Box mt={6}>
      <Typography variant="h5" gutterBottom>
        Reviews
      </Typography>

      {error && <Typography color="error">{error}</Typography>}

      {reviews.length === 0 ? (
        <Typography>No reviews yet.</Typography>
      ) : (
        <List>
          {reviews.map((review) => (
            <React.Fragment key={`${review.Author}-${review.CreatedAt}`}>
              <ListItem alignItems="flex-start">
                <Box>
                  <Typography fontWeight="bold">{review.Author}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rating: {review.Rating}/5
                  </Typography>
                  <Typography variant="body1">{review.Content}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {review.CreatedAt
                      ? new Date(review.CreatedAt).toLocaleDateString()
                      : 'Invalid Date'}
                  </Typography>
                </Box>
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      )}

      <Box mt={5}>
        <Typography variant="h6" gutterBottom>
          Add Your Review
        </Typography>
        <TextField
          label="Your Name"
          fullWidth
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Your Review"
          fullWidth
          multiline
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Typography>Rating:</Typography>
          <Rating
            value={rating}
            onChange={(_, newValue) => setRating(newValue)}
          />
        </Box>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Submit Review
        </Button>
      </Box>
    </Box>
  );
};

export default ReviewsSection;
