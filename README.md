# Movie Database SPA - React Application

## Overview

This is a Single Page Application (SPA) built with React, TypeScript, and Vite that interacts with a backend API developed using AWS Lambda functions. The application allows users to browse popular movies, TV series, and actors, view detailed information about each, and access premium features like creating fantasy movies and managing favorites when authenticated.

## Features

### Core Features
- Browse popular movies, TV series, and actors
- View detailed information for each media type
- User authentication (sign up and sign in)
- Private routes for premium features
- Responsive design
- TMDB Endpoints Used

### Premium Features (Requires Authentication)
- Create fantasy movie records
- Save favorites (movies, actors, TV series)
- Similar movies recommendations

### Technical Features
- React Router for client-side routing
- TypeScript for type safety
- AWS Lambda backend integration
- Private and public route handling
- Component-based architecture

## Folder Structure

```
public/
src/
├── api/
│   ├── actors.ts
│   ├── favorites.ts
│   ├── movies.ts
│   └── TVSeries.ts
├── assets/
├── components/
│   ├── ActorCard.tsx
│   ├── FantasyMovieForm.tsx
│   ├── Layout.tsx
│   ├── MovieCard.tsx
│   ├── PopularActors.tsx
│   ├── PrivateRoutes.tsx
│   ├── ReviewsSection.tsx
│   └── TVSeriesCard.tsx
├── data/
│   └── movies.ts
├── pages/
│   ├── ActorDetails.tsx
│   ├── Favorites.tsx
│   ├── Home.tsx
│   ├── MovieDetails.tsx
│   ├── PopularActors.tsx
│   ├── PopularMovies.tsx
│   ├── PopularTVSeries.tsx
│   ├── SignIn.tsx
│   ├── SignUp.tsx
│   ├── SimilarMovies.tsx
│   └── TVSeriesDetails.tsx
├── routes/
│   └── index.tsx
├── types/
│   └── index.ts
├── App.css
├── App.tsx
├── index.css
└── main.tsx
```

## Routes Configuration

The application uses React Router for navigation with the following routes:

```typescript
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'popular', element: <PopularMovies /> },
      { path: 'actors', element: <PopularActors /> },
      { path: 'tv', element: <PopularTVSeries /> },
      { 
        path: 'favorites', 
        element: (
          <PrivateRoute>
            <Favorites />
          </PrivateRoute>
        )
      },
      { 
        path: 'fantasy', 
        element: (
          <PrivateRoute>
            <FantasyMovieForm />
          </PrivateRoute>
        ) 
      },
      { path: 'movie/:id', element: <MovieDetails /> },
      { path: 'similar/:movieId', element: <SimilarMovies /> },
      { path: 'actor/:id', element: <ActorDetails /> },
      { path: 'tv/:id', element: <TVSeriesDetails /> },
      { path: 'signin', element: <SignIn /> },
      { path: 'signup', element: <SignUp /> },
    ],
  },
]);
```

### Route Descriptions

| Path | Component | Description | Authentication Required |
|------|-----------|-------------|--------------------------|
| `/` | Home | Application homepage | No |
| `/popular` | PopularMovies | List of popular movies | No |
| `/actors` | PopularActors | List of popular actors | No |
| `/tv` | PopularTVSeries | List of popular TV series | No |
| `/favorites` | Favorites | User's favorite items | Yes |
| `/fantasy` | FantasyMovieForm | Form to create fantasy movies | Yes |
| `/movie/:id` | MovieDetails | Detailed movie information | No |
| `/similar/:movieId` | SimilarMovies | Movies similar to specified movie | No |
| `/actor/:id` | ActorDetails | Detailed actor information | No |
| `/tv/:id` | TVSeriesDetails | Detailed TV series information | No |
| `/signin` | SignIn | User sign in form | No |
| `/signup` | SignUp | User registration form | No |

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory with the necessary API endpoints:
   ```
   VITE_API_BASE_URL=<your-api-base-url>
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment

The application is deployed to AWS S3. To deploy:

1. Build the production version:
   ```bash
   npm run build
   ```

2. Upload the contents of the `dist` folder to your S3 bucket.



## Backend Integration

The frontend communicates with backend services implemented as AWS Lambda functions through API Gateway. The backend provides:

- Movie data retrieval
- TV series data retrieval
- Actor information
- User authentication
- Fantasy movie creation
- Favorites management

## Development Notes

- The application was developed using Vite with TypeScript template
- React Tanstack Query has been implemented for better server state management
- Pagination has been added for data-heavy pages
- The code follows a component-based architecture with clear separation of concerns

## Enhancements Done

1. Implementation of  pagination for list views
2. Added multi-criteria search functionality
3. Enhancing the fantasy movie form with more fields and validation
4. Adding user profile management for signup and signin


## Assignment Requirements Met

### Good (40-50%) Requirements:
- [x] 3+ new views/pages
- [x] List views for movies, actors, TV series
- [x] Detail views for movies, actors, TV series
- [x] Additional parameterised URLs
- [x] Data hyperlinking
- [x] Additional data entity types (Actors, TV series)
- [x] Basic fantasy movie creation
- [x] Assignment 1 API integration
- [x] Frontend deployment to AWS S3
- [x] Display movie reviews

### Very Good (50-70%) Requirements:
- [x] Extensive data hyperlinking
- [x] Private and public routes
- [x] Premium functionality (fantasy movies, favorites)
- [x] Backend Auth API integration


## Video Demonstration
 https://www.youtube.com/watch?v=OKFsDgZY6I8

## GitHub Repositories

- Frontend (React): (https://github.com/veerajagannadham/Enterprise-Web-Development-Assignment-2-)
