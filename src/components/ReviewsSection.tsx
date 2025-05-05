import { useState, useEffect } from 'react'
import { Box, Typography, Button, TextField, List, ListItem, Divider } from '@mui/material'
import axios from 'axios'

interface Review {
  id: string
  author: string
  content: string
  rating: number
  created_at: string
}

interface ReviewsSectionProps {
  movieId: string
}

const ReviewsSection = ({ movieId }: ReviewsSectionProps) => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [newReview, setNewReview] = useState({
    author: '',
    content: '',
    rating: 0
  })

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true)
        // Replace with your actual API endpoint from Assignment 1
        const response = await axios.get(`/api/movies/${movieId}/reviews`)
        setReviews(response.data)
      } catch (err) {
        setError('Failed to fetch reviews')
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [movieId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Replace with your actual API endpoint from Assignment 1
      const response = await axios.post(`/api/movies/${movieId}/reviews`, newReview)
      setReviews([...reviews, response.data])
      setNewReview({ author: '', content: '', rating: 0 })
    } catch (err) {
      setError('Failed to submit review')
    }
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Reviews
      </Typography>
      
      {error && <Typography color="error">{error}</Typography>}
      
      {loading ? (
        <Typography>Loading reviews...</Typography>
      ) : reviews.length === 0 ? (
        <Typography>No reviews yet. Be the first to review!</Typography>
      ) : (
        <List>
          {reviews.map((review) => (
            <ListItem key={review.id} alignItems="flex-start">
              <Box>
                <Typography fontWeight="bold">{review.author}</Typography>
                <Typography>Rating: {review.rating}/5</Typography>
                <Typography>{review.content}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(review.created_at).toLocaleDateString()}
                </Typography>
              </Box>
              <Divider component="li" sx={{ my: 1 }} />
            </ListItem>
          ))}
        </List>
      )}
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add Your Review
        </Typography>
        <TextField
          label="Your Name"
          fullWidth
          margin="normal"
          value={newReview.author}
          onChange={(e) => setNewReview({...newReview, author: e.target.value})}
          required
        />
        <TextField
          label="Your Review"
          fullWidth
          multiline
          rows={4}
          margin="normal"
          value={newReview.content}
          onChange={(e) => setNewReview({...newReview, content: e.target.value})}
          required
        />
        <TextField
          label="Rating (1-5)"
          type="number"
          inputProps={{ min: 1, max: 5 }}
          margin="normal"
          value={newReview.rating}
          onChange={(e) => setNewReview({...newReview, rating: Number(e.target.value)})}
          required
        />
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
          Submit Review
        </Button>
      </Box>
    </Box>
  )
}

export default ReviewsSection;