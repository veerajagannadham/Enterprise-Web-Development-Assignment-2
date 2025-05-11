import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { createMovieReview, updateMovieReview, deleteMovieReview } from '../api/movies';
import type { Review, CreateReviewResponse } from '../types';

interface ReviewSectionProps {
  reviews: Review[];
  movieId: number;
  currentUser: { id: string; username: string } | null;
}

export default function ReviewSection({ 
  reviews = [], 
  movieId, 
  currentUser 
}: ReviewSectionProps) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [localReviews, setLocalReviews] = useState<Review[]>(reviews);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const handleSubmitReview = async () => {
    if (!content.trim()) {
      setError('Please enter your review');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const response: CreateReviewResponse = await createMovieReview({
        movieId,
        reviewerId: currentUser?.id || 'unauthenticated',
        content: content.trim()
      });

      setSuccess('Review submitted successfully!');

      const newReview: Review = {
        id: response.reviewId,
        MovieId: movieId,
        author: currentUser?.username || 'User',
        content: content.trim(),
        created_at: new Date().toISOString(),
        userId: currentUser?.id || undefined
      };

      setLocalReviews(prev => [newReview, ...prev]);
      setContent('');
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (review: Review) => {
    setEditingReviewId(review.id);
    setEditContent(review.content);
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditContent('');
  };

  const handleUpdateReview = async () => {
    if (!editingReviewId || !editContent.trim()) {
      setError('Please enter your review');
      return;
    }

    try {
      setIsUpdating(true);
      setError(null);
      setSuccess(null);

      await updateMovieReview(
        movieId,
        editingReviewId,
        { content: editContent.trim() }
      );

      setSuccess('Review updated successfully!');
      setLocalReviews(prev =>
        prev.map(review =>
          review.id === editingReviewId
            ? { ...review, content: editContent.trim() }
            : review
        )
      );
      handleCancelEdit();
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to update review');
    } finally {
      setIsUpdating(false);
    }
  };



  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Movie Reviews
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your review..."
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleSubmitReview}
          disabled={submitting || !content.trim()}
          startIcon={submitting ? <CircularProgress size={20} /> : null}
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box>
        <Typography variant="subtitle1" gutterBottom>
          {localReviews.length} {localReviews.length === 1 ? 'Review' : 'Reviews'}
        </Typography>

        {localReviews.length > 0 ? (
          <List>
            {localReviews.map((review) => (
              <div key={review.id}>
                <ListItem alignItems="flex-start">
                  {editingReviewId === review.id ? (
                    <Box sx={{ width: '100%' }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        sx={{ mb: 2 }}
                      />
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant="contained"
                          onClick={handleUpdateReview}
                          disabled={isUpdating}
                          startIcon={isUpdating ? <CircularProgress size={20} /> : null}
                        >
                          {isUpdating ? 'Updating...' : 'Save'}
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={handleCancelEdit}
                          disabled={isUpdating}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography fontWeight="bold">
                            {review.author}
                          </Typography>
                          <Box>
                            <IconButton
                              aria-label="edit"
                              onClick={() => handleStartEdit(review)}
                              size="small"
                              sx={{ mr: 1 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography sx={{ display: 'block', my: 1 }}>
                            {review.content}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(review.created_at).toLocaleDateString()}
                          </Typography>
                        </>
                      }
                    />
                  )}
                </ListItem>
                <Divider />
              </div>
            ))}
          </List>
        ) : (
          <Typography color="text.secondary">No reviews yet</Typography>
        )}
      </Box>
    </Paper>
  );
}
