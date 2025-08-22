// This line imports React and two special functions from React
// useState: Allows us to store and change data in our component
// useEffect: Allows us to run code when something changes (like when the page loads)
import React, { useState, useEffect } from 'react';

// This imports our custom authentication context (think of it as a shared data store)
// useAuth gives us access to login, register, and logout functions
import { useAuth } from '../contexts/AuthContext';

// This imports navigation functions from React Router
// useNavigate: Allows us to move users to different pages
// Link: Creates clickable links that don't refresh the page
import { useNavigate, Link } from 'react-router-dom';

// This defines our Register component - it's like a function that creates the registration page
const Register = () => {
  // This gets the register function from our authentication context
  // It's like borrowing a tool from a shared toolbox
  const { register } = useAuth();
  
  // This creates a navigation function that we can use to move users around
  const navigate = useNavigate();
  
  // These are state variables - they store data that can change
  // loading: tracks whether we're currently processing the registration
  // error: stores any error messages to show the user
  // cooldownUntil: tracks when the user can try registering again (for security)
  // cooldownCountdown: shows a countdown timer to the user
  // attemptLevel: tracks how many times the user has tried (for increasing delays)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldownUntil, setCooldownUntil] = useState(null);
  const [cooldownCountdown, setCooldownCountdown] = useState('');
  const [attemptLevel, setAttemptLevel] = useState(0);
  
  // This stores all the form data (what the user types)
  // It's like a box that holds all the information the user enters
  const [formData, setFormData] = useState({
    firstName: '',      // User's first name
    lastName: '',       // User's last name
    username: '',       // User's chosen username
    email: '',          // User's email address
    password: '',       // User's password
    confirmPassword: '' // User's password confirmation
  });

  // This function runs every time the user types in any input field
  // It updates our formData state with what the user typed
  const handleInputChange = (e) => {
    // e.target gives us the input field that was changed
    // name is which field (like "firstName" or "email")
    // value is what the user typed
    const { name, value } = e.target;
    
    // We start with the value the user typed
    let sanitizedValue = value;

    // Special rule: first and last names can't have numbers or special characters
    // This prevents users from typing things like "John123" or "Mary@"
    if (name === 'firstName' || name === 'lastName') {
      // This removes any characters that aren't letters, spaces, hyphens, apostrophes, or periods
      sanitizedValue = value.replace(/[^a-zA-Z\s\-'.]/g, '');
    }
    
    // Now we update our formData with the cleaned value
    // prev means "previous formData" - we keep everything the same except what changed
    setFormData(prev => ({
      ...prev,           // Keep all the old values
      [name]: sanitizedValue  // Update only the field that changed
    }));
  };

  // This runs when the component first loads (like when someone visits the page)
  // It checks if there's a cooldown timer saved from before
  useEffect(() => {
    try {
      // localStorage is like a small storage box in the user's browser
      // We check if there's a saved cooldown timer
      const storedCd = localStorage.getItem('registerCooldown');
      if (storedCd) {
        // If we found something, we try to read it
        const parsed = JSON.parse(storedCd);
        // Check if the cooldown is still active (not expired yet)
        if (parsed?.until && parsed.until > Date.now()) {
          // If it's still active, we restore the cooldown state
          setCooldownUntil(parsed.until);
          setAttemptLevel(parsed.level || 0);
        } else {
          // If it's expired, we remove it from storage
          localStorage.removeItem('registerCooldown');
        }
      }
    } catch {} // If anything goes wrong, we just ignore it and continue
  }, []); // The empty array means "only run this once when the page loads"

  // This runs whenever cooldownUntil changes
  // It creates a countdown timer that shows the user how long to wait
  useEffect(() => {
    // If there's no cooldown, we don't need to do anything
    if (!cooldownUntil) return;
    
    // This function updates the countdown display
    const update = () => {
      // Calculate how many milliseconds are left
      const ms = cooldownUntil - Date.now();
      
      // If time is up, clear everything
      if (ms <= 0) {
        setCooldownUntil(null);
        setCooldownCountdown('');
        localStorage.removeItem('registerCooldown');
        return;
      }
      
      // Convert milliseconds to minutes and seconds
      const totalSec = Math.ceil(ms / 1000);
      const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');  // Minutes with leading zero
      const ss = String(totalSec % 60).padStart(2, '0');              // Seconds with leading zero
      
      // Update the countdown display (like "01:30")
      setCooldownCountdown(`${mm}:${ss}`);
    };
    
    // Run the update immediately
    update();
    
    // Then run it every 1000 milliseconds (1 second)
    const id = setInterval(update, 1000);
    
    // Clean up: stop the timer when the component unmounts
    return () => clearInterval(id);
  }, [cooldownUntil]); // This runs whenever cooldownUntil changes

  // This function runs when the user clicks the "Create Account" button
  const handleSubmit = async (e) => {
    // Prevent the page from refreshing when the form is submitted
    e.preventDefault();
    
    // Check if the user is still in cooldown period
    if (cooldownUntil && cooldownUntil > Date.now()) {
      setError('Please wait before trying again.');
      return; // Stop here, don't continue
    }
    
    // VALIDATION SECTION - Check if all required fields are filled
    // trim() removes spaces from the beginning and end
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.username.trim() || !formData.email.trim() || !formData.password) {
      setError('First name, last name, username, email, and password are required');
      return; // Stop here if anything is missing
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Check if password is long enough
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    // Check if names contain only allowed characters
    // This is a regular expression (regex) - it's like a pattern matcher
    const namePattern = /^[A-Za-z\s\-'.]+$/;
    if (!namePattern.test(formData.firstName) || !namePattern.test(formData.lastName)) {
      setError("Names can only contain letters, spaces, hyphens (-), apostrophes ('), and periods (.)");
      return;
    }

    // If we get here, all validation passed, so try to register the user
    try {
      // Show loading state and clear any previous errors
      setLoading(true);
      setError('');

      // Call the register function from our auth context
      // This sends the data to the server to create the account
      const result = await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      // Check if registration was successful
      if (result.success) {
        // If successful, redirect to the home page
        navigate('/');
      } else {
        // If failed, show the error message
        setError(result.error || 'Registration failed');
        
        // Apply security cooldown to prevent rapid retries
        // Each failed attempt makes the wait longer
        const levels = [2000, 5000, 10000]; // 2 seconds, 5 seconds, 10 seconds
        const nextLevel = Math.min(attemptLevel + 1, levels.length - 1);
        const duration = levels[nextLevel];
        const until = Date.now() + duration;
        
        // Update our state
        setAttemptLevel(nextLevel);
        setCooldownUntil(until);
        
        // Save the cooldown to localStorage so it persists if user refreshes
        try {
          localStorage.setItem('registerCooldown', JSON.stringify({ until, level: nextLevel }));
        } catch {} // Ignore any errors
      }
    } catch (err) {
      // If something unexpected went wrong, show a generic error
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      // This always runs, whether success or failure
      // Stop the loading state
      setLoading(false);
    }
  };

  // This is what gets displayed on the page
  return (
    // Main container for the entire page
    <div className="container">
      {/* Container for the registration form */}
      <div className="auth-container">
        {/* The white card that contains the form */}
        <div className="auth-card">
          {/* Header section with title and description */}
          <div className="auth-header">
            <h1>Create Account</h1>
            <p>Join Chick'N Needs and start your poultry farming journey</p>
          </div>

          {/* The actual form that collects user input */}
          {/* onSubmit={handleSubmit} means "when form is submitted, run handleSubmit function" */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* First row: First Name and Last Name side by side */}
            <div className="form-row">
              {/* First Name input field */}
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"                                    // This is a text input field
                  id="firstName"                                  // Unique identifier for this field
                  name="firstName"                                // Name used when form is submitted
                  value={formData.firstName}                      // Current value from our state
                  onChange={handleInputChange}                     // Function to run when user types
                  className="form-input"                          // CSS styling class
                  placeholder="Enter your first name"             // Hint text shown when field is empty
                  pattern="[A-Za-z\s\-'.]+"                      // HTML5 validation pattern
                  title="Only letters, spaces, hyphens (-), apostrophes ('), and periods (.) are allowed"  // Tooltip shown on hover
                  required                                        // Field must be filled before form can be submitted
                />
              </div>
              
              {/* Last Name input field */}
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"                                    // This is a text input field
                  id="lastName"                                   // Unique identifier for this field
                  name="lastName"                                 // Name used when form is submitted
                  value={formData.lastName}                       // Current value from our state
                  onChange={handleInputChange}                     // Function to run when user types
                  className="form-input"                          // CSS styling class
                  placeholder="Enter your last name"              // Hint text shown when field is empty
                  pattern="[A-Za-z\s\-'.]+"                      // HTML5 validation pattern
                  title="Only letters, spaces, hyphens (-), apostrophes ('), and periods (.) are allowed"  // Tooltip shown on hover
                  required                                        // Field must be filled before form can be submitted
                />
              </div>
            </div>

            {/* Username input field */}
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"                                      // This is a text input field
                id="username"                                     // Unique identifier for this field
                name="username"                                   // Name used when form is submitted
                value={formData.username}                         // Current value from our state
                onChange={handleInputChange}                       // Function to run when user types
                className="form-input"                            // CSS styling class
                placeholder="Choose a username"                   // Hint text shown when field is empty
                required                                          // Field must be filled before form can be submitted
              />
            </div>

            {/* Email input field */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"                                     // This is an email input field (shows email keyboard on mobile)
                id="email"                                        // Unique identifier for this field
                name="email"                                      // Name used when form is submitted
                value={formData.email}                            // Current value from our state
                onChange={handleInputChange}                       // Function to run when user types
                className="form-input"                            // CSS styling class
                placeholder="Enter your email address"            // Hint text shown when field is empty
                required                                          // Field must be filled before form can be submitted
              />
            </div>

            {/* Password input field */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"                                  // This hides the text as user types (shows dots)
                id="password"                                     // Unique identifier for this field
                name="password"                                   // Name used when form is submitted
                value={formData.password}                         // Current value from our state
                onChange={handleInputChange}                       // Function to run when user types
                className="form-input"                            // CSS styling class
                placeholder="Create a strong password"            // Hint text shown when field is empty
                required                                          // Field must be filled before form can be submitted
                minLength="8"                                     // Minimum 8 characters required
                onPaste={(e) => e.preventDefault()}               // Prevent pasting (security feature)
                onCopy={(e) => e.preventDefault()}                // Prevent copying (security feature)
                onCut={(e) => e.preventDefault()}                 // Prevent cutting (security feature)
              />
              {/* Help text below the password field */}
              <small className="form-help">Minimum 8 characters, use upper/lowercase, number, symbol</small>
            </div>

            {/* Confirm Password input field */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"                                  // This hides the text as user types (shows dots)
                id="confirmPassword"                              // Unique identifier for this field
                name="confirmPassword"                            // Name used when form is submitted
                value={formData.confirmPassword}                  // Current value from our state
                onChange={handleInputChange}                       // Function to run when user types
                className="form-input"                            // CSS styling class
                placeholder="Confirm your password"               // Hint text shown when field is empty
                required                                          // Field must be filled before form can be submitted
                minLength="8"                                     // Minimum 8 characters required
                onPaste={(e) => e.preventDefault()}               // Prevent pasting (security feature)
                onCopy={(e) => e.preventDefault()}                // Prevent copying (security feature)
                onCut={(e) => e.preventDefault()}                 // Prevent cutting (security feature)
              />
            </div>

            {/* Error message display - only shows when there's an error */}
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* Button section */}
            <div className="form-actions">
              {/* Submit button - creates the account */}
              <button
                type="submit"                                    // This button submits the form
                className="btn btn-primary auth-btn"              // CSS styling classes
                disabled={loading}                               // Disable button while processing
              >
                {/* Button text changes based on current state */}
                {cooldownUntil ? `Wait (${cooldownCountdown || '00:02'})` : (loading ? 'Creating Account...' : 'Create Account')}
              </button>
            </div>
          </form>

          {/* Footer section with link to login page */}
          <div className="auth-footer">
            <p>Already have an account? <Link to="/login" className="auth-link">Log In</Link></p>
          </div>

        </div>
      </div>
    </div>
  );
};

// This exports the Register component so other files can use it
export default Register;
