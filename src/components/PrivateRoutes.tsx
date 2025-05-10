// src/components/PrivateRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../api/movies';
import type { ReactNode } from 'react';

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const location = useLocation();
  const user = getCurrentUser();
  
  if (!user) {
    // Redirect to sign-in page with return location
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;