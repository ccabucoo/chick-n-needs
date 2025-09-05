import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [lockoutUntil, setLockoutUntil] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [cooldownUntil, setCooldownUntil] = useState(null);
  const [cooldownCountdown, setCooldownCountdown] = useState('');
  const [attemptLevel, setAttemptLevel] = useState(0);

  const { login, clearError, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    clearError();
    setError('');
    // Restore lockout from storage if present
    try {
      const stored = localStorage.getItem('loginLockout');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.until && parsed.until > Date.now()) {
          setLockoutUntil(parsed.until);
        } else {
          localStorage.removeItem('loginLockout');
        }
      }
      const storedCd = localStorage.getItem('loginCooldown');
      if (storedCd) {
        const parsedCd = JSON.parse(storedCd);
        if (parsedCd?.until && parsedCd.until > Date.now()) {
          setCooldownUntil(parsedCd.until);
          setAttemptLevel(parsedCd.level || 0);
        } else {
          localStorage.removeItem('loginCooldown');
        }
      }
    } catch {}
  }, [clearError]);

  useEffect(() => {
    if (!lockoutUntil) return;
    const update = () => {
      const ms = lockoutUntil - Date.now();
      if (ms <= 0) {
        setLockoutUntil(null);
        setCountdown('');
        localStorage.removeItem('loginLockout');
        return;
      }
      const totalSec = Math.ceil(ms / 1000);
      const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
      const ss = String(totalSec % 60).padStart(2, '0');
      setCountdown(`${mm}:${ss}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [lockoutUntil]);

  useEffect(() => {
    if (!cooldownUntil) return;
    const update = () => {
      const ms = cooldownUntil - Date.now();
      if (ms <= 0) {
        setCooldownUntil(null);
        setCooldownCountdown('');
        localStorage.removeItem('loginCooldown');
        return;
      }
      const totalSec = Math.ceil(ms / 1000);
      const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
      const ss = String(totalSec % 60).padStart(2, '0');
      setCooldownCountdown(`${mm}:${ss}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validate = () => {
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password || formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (lockoutUntil && lockoutUntil > Date.now()) {
      setError('Account temporarily locked. Please wait until the lock expires.');
      return;
    }
    if (cooldownUntil && cooldownUntil > Date.now()) {
      setError('Please wait before trying again.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const result = await login(formData.email.trim().toLowerCase(), formData.password);
      if (result?.success) {
        // Clear cooldown on success
        setAttemptLevel(0);
        setCooldownUntil(null);
        setCooldownCountdown('');
        localStorage.removeItem('loginCooldown');
        navigate(from, { replace: true });
      } else {
        // Handle specific error messages
        const errorMessage = result?.error || 'Login failed. Please try again.';
        setError(errorMessage);
        
        if (result?.lockedUntil) {
          setLockoutUntil(result.lockedUntil);
        } else {
          // Apply short exponential cooldown to prevent rapid retries
          const levels = [2000, 5000, 10000]; // 2s, 5s, 10s
          const nextLevel = Math.min(attemptLevel + 1, levels.length - 1);
          const duration = levels[nextLevel];
          const until = Date.now() + duration;
          setAttemptLevel(nextLevel);
          setCooldownUntil(until);
          try {
            localStorage.setItem('loginCooldown', JSON.stringify({ until, level: nextLevel }));
          } catch {}
        }
      }
    } catch (err) {
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Login</h1>
            <p>Welcome back to Chick'N Needs</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your email address"
                autoComplete="email"
                autoFocus
                disabled={loading || !!lockoutUntil || !!cooldownUntil}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  minLength={8}
                  onPaste={(e) => e.preventDefault()}
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  disabled={loading || !!lockoutUntil || !!cooldownUntil}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {(error || authError) && (
              <div className="error-message">
                {error || authError}
                {(error || authError) === 'Account does not exist' && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <Link to="/register" className="auth-link" style={{ fontSize: '0.9rem' }}>
                      Create a new account
                    </Link>
                  </div>
                )}
              </div>
            )}

            <button type="submit" className="btn btn-primary auth-btn" disabled={loading || !!lockoutUntil || !!cooldownUntil}>
              {lockoutUntil
                ? `Locked (${countdown})`
                : cooldownUntil
                  ? `Wait (${cooldownCountdown || '00:02'})`
                  : (loading ? 'Logging In...' : 'Login')}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account? <Link to="/register" className="auth-link">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
