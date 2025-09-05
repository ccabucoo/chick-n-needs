import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    // Check for stored user data and token on app load
    const storedUser = localStorage.getItem('chickNNeedsUser');
    const storedToken = localStorage.getItem('chickNNeedsToken');
    
    if (storedUser && storedToken && storedUser !== 'undefined') {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && typeof parsedUser === 'object') {
          setUser(parsedUser);
          // Verify token with backend
          verifyToken(storedToken);
        } else {
          // Invalid user data, clear storage
          localStorage.removeItem('chickNNeedsUser');
          localStorage.removeItem('chickNNeedsToken');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('chickNNeedsUser');
        localStorage.removeItem('chickNNeedsToken');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user || data.data);
          localStorage.setItem('chickNNeedsUser', JSON.stringify(data.user || data.data));
        } else {
          // Token invalid, clear storage without logout
          setUser(null);
          localStorage.removeItem('chickNNeedsUser');
          localStorage.removeItem('chickNNeedsToken');
        }
      } else {
        // Token invalid, clear storage without logout
        setUser(null);
        localStorage.removeItem('chickNNeedsUser');
        localStorage.removeItem('chickNNeedsToken');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      // Clear storage without logout
      setUser(null);
      localStorage.removeItem('chickNNeedsUser');
      localStorage.removeItem('chickNNeedsToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Include cookies for refresh token
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem('chickNNeedsUser', JSON.stringify(data.user));
        localStorage.setItem('chickNNeedsToken', data.token);
        // Clear any login lockout on success
        localStorage.removeItem('loginLockout');
        
        // Set up token refresh timer
        if (data.expiresIn) {
          const refreshTime = (data.expiresIn - 300) * 1000; // Refresh 5 minutes before expiry
          window.refreshTokenTimer = setTimeout(() => {
            refreshToken();
          }, refreshTime);
        }
        
        return { success: true };
      } else {
        // Handle specific error cases
        if (response.status === 429) {
          // Rate limited or account locked
          setError(data.message || 'Account temporarily locked');
          const lockedUntil = data.lockedUntil || (Date.now() + 15 * 60 * 1000);
          try {
            localStorage.setItem('loginLockout', JSON.stringify({ until: lockedUntil }));
          } catch (e) {}
          return { success: false, error: data.error || data.message, lockedUntil };
        } else if (response.status === 401) {
          // Invalid credentials
          setError(data.message || 'Invalid email or password');
          return { success: false, error: data.error || data.message, remainingAttempts: data.remainingAttempts };
        } else {
          setError(data.error);
          return { success: false, error: data.error };
        }
      }
    } catch (error) {
      const errorMessage = 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          localStorage.setItem('chickNNeedsToken', data.token);
          
          // Set up next refresh
          if (data.expiresIn) {
            const refreshTime = (data.expiresIn - 300) * 1000;
            window.refreshTokenTimer = setTimeout(() => {
              refreshToken();
            }, refreshTime);
          }
        }
      } else {
        // Refresh failed, logout user
        logout();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (data.success) {
        // Registration successful - do NOT automatically log in the user
        // User will need to manually log in after registration
        return { success: true };
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessage = data.errors.map(err => err.msg).join(', ');
          setError(errorMessage);
          return { success: false, error: errorMessage };
        } else {
          setError(data.error);
          return { success: false, error: data.error };
        }
      }
    } catch (error) {
      const errorMessage = 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint to clear refresh token
      const token = localStorage.getItem('chickNNeedsToken');
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all state and storage
      setUser(null);
      setError(null);
      setLoading(false);
      
      // Clear all localStorage items
      localStorage.removeItem('chickNNeedsUser');
      localStorage.removeItem('chickNNeedsToken');
      localStorage.removeItem('loginLockout');
      
      // Clear any timers
      if (window.refreshTokenTimer) {
        clearTimeout(window.refreshTokenTimer);
        window.refreshTokenTimer = null;
      }
      
      // Don't reload here - let the calling component handle navigation
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      setLoading(true);

      const token = localStorage.getItem('chickNNeedsToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem('chickNNeedsUser', JSON.stringify(data.user));
        return { success: true };
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessage = data.errors.map(err => err.msg).join(', ');
          setError(errorMessage);
          return { success: false, error: errorMessage };
        } else {
          setError(data.error);
          return { success: false, error: data.error };
        }
      }
    } catch (error) {
      const errorMessage = 'Profile update failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getAuthToken = () => {
    return localStorage.getItem('chickNNeedsToken');
  };

  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('chickNNeedsToken');
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    loading,
    error,
    getAuthToken,
    isAuthenticated,
    clearError: () => setError(null),
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
