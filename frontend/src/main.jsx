// This imports the createRoot function from React DOM
// createRoot is the modern way to start a React application
// Think of it like the "ignition key" that starts your React car
import { createRoot } from 'react-dom/client'

// This imports our main CSS file that contains all the styling
// It's like importing the paint and decorations for your website
import './index.css'

// This imports our main App component (the App.jsx file we saw earlier)
// App is like the blueprint for your entire website
import App from './App.jsx'

// This is where everything starts!
// createRoot(document.getElementById('root')) finds the HTML element with id="root"
// This element is in your public/index.html file
// .render(<App />) tells React to display your App component inside that element
// It's like telling React "start the engine and put the App component in the driver's seat"
createRoot(document.getElementById('root')).render(
  <App />
)
