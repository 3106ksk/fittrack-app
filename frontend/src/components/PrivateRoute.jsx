import { Navigate } from 'react-router-dom';
import { useAuth } from './Hook';
import PropTypes from 'prop-types';

const PrivateRoute = ({ element }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return element;
};

PrivateRoute.propTypes = {
  element: PropTypes.node.isRequired
};

export default PrivateRoute; 