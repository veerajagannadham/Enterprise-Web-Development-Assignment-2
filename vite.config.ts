import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // This is the default Vite port
    proxy: {
      // Proxy API requests to your backend
      '/api': {
        target: 'https://6tjvw0a9d6.execute-api.us-east-1.amazonaws.com/prod', // Your backend server port
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      // Proxy TMDB API requests
      '/tmdb': {
        target: 'https://api.themoviedb.org/3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tmdb/, ''),
        headers: {
          Authorization: `Bearer ${process.env.VITE_TMDB_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    }
  }
})