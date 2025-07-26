import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

// Component for protecting admin-only routes
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth);

  // Show loading indicator while checking authentication status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to dashboard if authenticated but not an admin
  if (user && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Render admin content if authenticated and user is an admin
  return children;
};

AdminRoute.propTypes = {
  children: PropTypes.node.isRequired
};

export default AdminRoute; 