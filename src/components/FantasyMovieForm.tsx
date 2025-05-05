import { useState } from 'react'
import type { FantasyMovie } from '../types'
import { Button, TextField, Box, Chip } from '@mui/material'

const FantasyMovieForm = () => {
  const [movie, setMovie] = useState<FantasyMovie>({
    title: '',
    overview: '',
    genres: [],
    releaseDate: '',
    runtime: undefined,
    productionCompanies: []
  })
  
  const [newGenre, setNewGenre] = useState('')
  const [newCompany, setNewCompany] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Submit to backend
    console.log('Submitting fantasy movie:', movie)
  }

  const handleAddGenre = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newGenre) {
      e.preventDefault()
      if (!movie.genres?.includes(newGenre)) {
        setMovie({
          ...movie, 
          genres: [...(movie.genres || []), newGenre]
        })
        setNewGenre('')
      }
    }
  }

  const handleAddCompany = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newCompany) {
      e.preventDefault()
      if (!movie.productionCompanies?.includes(newCompany)) {
        setMovie({
          ...movie, 
          productionCompanies: [...(movie.productionCompanies || []), newCompany]
        })
        setNewCompany('')
      }
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
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
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          {movie.genres?.map((genre) => (
            <Chip 
              key={genre} 
              label={genre} 
              onDelete={() => 
                setMovie({
                  ...movie, 
                  genres: movie.genres?.filter(g => g !== genre)
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
        />
      </Box>
      
      {/* Production Companies input */}
      <Box sx={{ my: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          {movie.productionCompanies?.map((company) => (
            <Chip 
              key={company} 
              label={company} 
              onDelete={() => 
                setMovie({
                  ...movie, 
                  productionCompanies: movie.productionCompanies?.filter(c => c !== company)
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
      
      <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
        Create Fantasy Movie
      </Button>
    </Box>
  )
}

export default FantasyMovieForm