// This imports React - the main library we use to build our website
import React from 'react';

// This creates an ErrorBoundary class - it's like a safety net for your website
// ErrorBoundary catches errors that happen in React components and shows a friendly message instead of crashing
// It's like having a backup plan when something goes wrong
class ErrorBoundary extends React.Component {
  
  // CONSTRUCTOR - This runs when the ErrorBoundary is first created
  // It's like setting up the safety net before you start using it
  constructor(props) {
    // super(props) calls the parent class (React.Component) constructor
    // This is required for class components in React
    super(props);
    
    // this.state creates a storage area for this component's data
    // hasError: tracks whether an error has happened (starts as false)
    // error: stores the actual error that occurred (starts as null)
    this.state = { hasError: false, error: null };
  }

  // STATIC METHOD - This is a special method that React calls automatically when an error occurs
  // It's like an emergency response system that activates when something goes wrong
  static getDerivedStateFromError(error) {
    // When this method is called, we know an error happened
    // We return a new state that sets hasError to true and stores the error
    // This tells React "something went wrong, show the error screen"
    return { hasError: true, error };
  }

  // LIFECYCLE METHOD - This runs after an error is caught
  // It's like a security camera that records what went wrong for debugging
  componentDidCatch(error, errorInfo) {
    // Log the error to the browser console so developers can see what happened
    // This is like writing down what went wrong in a logbook
    console.error('Error caught by boundary:', error, errorInfo);
  }

  // RENDER METHOD - This determines what gets displayed on the page
  // It's like deciding what to show the user
  render() {
    // Check if an error has occurred
    if (this.state.hasError) {
      // If there's an error, show a friendly error message instead of crashing
      return (
        // This creates a container for the error message
        <div className="error-boundary">
          {/* Container for proper spacing and layout */}
          <div className="container">
            {/* Card that contains the error message */}
            <div className="card text-center">
              {/* Error title with emoji */}
              <h2>😵 Something went wrong</h2>
              
              {/* Friendly message to reassure the user */}
              <p>Don't worry, this is just a temporary issue.</p>
              
              {/* Button that lets the user refresh the page to fix the error */}
              <button 
                className="btn btn-primary"  // CSS classes for styling
                onClick={() => {
                  // When button is clicked, this function runs
                  
                  // Reset the error state back to normal
                  this.setState({ hasError: false, error: null });
                  
                  // Reload the entire page to start fresh
                  // This is like restarting your computer when something goes wrong
                  window.location.reload();
                }}
              >
                🔄 Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    // If there's no error, show the normal content
    // this.props.children means "show whatever was inside the ErrorBoundary tags"
    // It's like saying "everything is working fine, show the normal page"
    return this.props.children;
  }
}

// This exports the ErrorBoundary class so other files can use it
// It's like making the safety net available to the rest of your website
export default ErrorBoundary;
