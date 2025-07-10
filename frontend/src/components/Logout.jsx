import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './Hook';

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  return <div>ログアウト中...</div>;
};

export default Logout;
