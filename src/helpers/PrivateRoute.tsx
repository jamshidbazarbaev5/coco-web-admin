import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../api/auth';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const location = useLocation();
  
  if (!isAuthenticated()) {
    // Redirect to login page but save the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}