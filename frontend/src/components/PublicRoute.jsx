import { Navigate } from 'react-router-dom';
import { useAuth } from './Hook';
import PropTypes from 'prop-types';

const PublicRoute = ({ element, restricted = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (user && restricted) {
    return <Navigate to="/dashboard" replace />;
  }

  return element;
};

PublicRoute.propTypes = {
  element: PropTypes.node.isRequired,
  restricted: PropTypes.bool
};

export default PublicRoute; 