import { useState, useEffect } from 'react'
import { 
  Box, Typography, Button, TextField, List, ListItem, 
  Divider, Select, MenuItem, FormControl, InputLabel 
} from '@mui/material'
import { 
  createReview, 
  updateReview, 
  getTranslatedReview,
  fetchMovieById 
} from '../api/movies'
import type { Review } from '../types'

// This helps TypeScript understand the structure of our form data
interface ReviewFormData {
  author: string;
  content: string;
  rating: number;
}

const ReviewsSection = ({ movieId }: { movieId: string }) => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [newReview, setNewReview] = useState<ReviewFormData>({
    author: '',
    content: '',
    rating: 5
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [translation, setTranslation] = useState<{
    reviewId: number
    text: string
  } | null>(null)

  // Fetch reviews for this movie
  useEffect(() => {
    const fetchReviews = async () => {
      const movie = await fetchMovieById(movieId)
      setReviews(movie.reviews || [])
    }
    fetchReviews()
  }, [movieId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const review = await createReview({
      movieId,
      ...newReview
    })
    setReviews([...reviews, review])
    setNewReview({ author: '', content: '', rating: 5 })
  }

    const handleUpdate = async () => {
    if (!editingId) return
    const review = reviews.find(r => r.ReviewId === editingId)
    if (!review) return
    
    const updated = await updateReview(
      editingId.toString(),
      {
        content: review.Content,
        rating: Number(review.Rating) // Ensure rating is a number
      }
    )
    setReviews(reviews.map(r => r.ReviewId === editingId ? updated : r))
    setEditingId(null)
  }

  const handleTranslate = async (reviewId: number, language: string) => {
    const { translatedText } = await getTranslatedReview(
      reviewId.toString(),
      movieId,
      language
    )
    setTranslation({ reviewId, text: translatedText })
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Movie Reviews
      </Typography>

      {/* Reviews List */}
      <List>
        {reviews.map(review => (
          <ListItem key={review.ReviewId} sx={{ flexDirection: 'column', alignItems: 'start' }}>
            <Box width="100%">
              <Typography fontWeight="bold">{review.Author}</Typography>
              {translation?.reviewId === review.ReviewId ? (
                <Typography>Translated: {translation.text}</Typography>
              ) : (
                <Typography>{review.Content}</Typography>
              )}
              <Typography>Rating: {review.Rating}/5</Typography>
            </Box>

            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <Button size="small" onClick={() => setEditingId(review.ReviewId)}>
                Edit
              </Button>
              <FormControl size="small">
                <InputLabel>Translate</InputLabel>
                <Select
                  value=""
                  onChange={(e) => handleTranslate(review.ReviewId, e.target.value)}
                  label="Translate"
                >
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                  <MenuItem value="de">German</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Divider sx={{ my: 2 }} />
          </ListItem>
        ))}
      </List>

      {/* Add Review Form */}
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Typography variant="h6">Add Review</Typography>
        <TextField
          label="Your Name"
          fullWidth
          value={newReview.author}
          onChange={(e) => setNewReview({...newReview, author: e.target.value})}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Your Review"
          fullWidth
          multiline
          rows={4}
          value={newReview.content}
          onChange={(e) => setNewReview({...newReview, content: e.target.value})}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Rating (1-5)"
          type="number"
          inputProps={{ min: 1, max: 5 }}
          value={newReview.rating}
          onChange={(e) => setNewReview({...newReview, rating: Number(e.target.value)})}
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained">
          Submit Review
        </Button>
      </Box>
    </Box>
  )
}

export default ReviewsSection