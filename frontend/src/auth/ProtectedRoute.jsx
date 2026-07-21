import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "./AuthContext.jsx";
import FullScreenLoader from "../components/FullScreenLoader.jsx";

/**
 * Wrap any set of routes that require a logged-in user.
 * Unauthenticated visitors are redirected to /login, and the page they
 * tried to reach is preserved so we can send them back after login.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, booting } = useAuth();
  const location = useLocation();

  if (booting) {
    return <FullScreenLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

/**
 * Wrap /login and /signup so an already-authenticated user is bounced
 * straight to the dashboard instead of seeing the auth forms again.
 */
export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, booting } = useAuth();

  if (booting) {
    return <FullScreenLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
