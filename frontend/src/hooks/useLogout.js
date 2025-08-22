import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const useLogout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      // Call the logout function from AuthContext
      await logout();
      
      // Navigate to home page after successful logout
      navigate('/', { replace: true });
      
      // Force a small delay to ensure state is cleared
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, clear local state and redirect
      navigate('/', { replace: true });
      window.location.reload();
    }
  };

  return handleLogout;
};
