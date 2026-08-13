import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Guards a route by login state and optionally by role
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <p className="center-msg">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return children;
};

export default ProtectedRoute;
