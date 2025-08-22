// This line imports specific functions from the 'react-router-dom' library
// BrowserRouter: Creates the main router for the entire app
// Routes: Container for all the individual routes
// Route: Defines a single route (like a page)
// Navigate: Used to redirect users to different pages
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// This imports our custom context providers that manage global state
// AuthProvider: Manages user login/logout and authentication state
// CartProvider: Manages shopping cart data across the app
// ProductProvider: Manages product data and search functionality
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ProductProvider } from './contexts/ProductContext';

// Import all the page components that users will see
// These are like the different "screens" or "pages" in our app
import HomePage from './pages/HomePage';           // The main landing page
import ProductCatalog from './pages/ProductCatalog'; // Shows all products
import ProductDetails from './pages/ProductDetails'; // Shows details of one product
import Login from './pages/Login';                 // User login page
import Register from './pages/Register';           // User registration page
import UserProfile from './pages/UserProfile';     // User's profile page
import Cart from './pages/Cart';                   // Shopping cart page
import Orders from './pages/Orders';               // User's order history
import OrderDetails from './pages/OrderDetails';   // Details of a specific order
import Wishlist from './pages/Wishlist';           // User's saved items
import Notifications from './pages/Notifications'; // User's notifications
import About from './pages/About';                 // About the company page
import Contact from './pages/Contact';             // Contact information page

// Import reusable components that appear on multiple pages
import Navbar from './components/Navbar';           // Navigation bar at the top
import ProtectedRoute from './components/ProtectedRoute'; // Wrapper that checks if user is logged in

// This is the main App function - it's like the "brain" of our application
// It decides what to show and how to organize everything
function App() {
  // The return statement tells React what HTML to display
  return (
    // AuthProvider wraps everything to provide authentication data to all components
    <AuthProvider>
      {/* ProductProvider provides product data to all components */}
      <ProductProvider>
        {/* CartProvider provides shopping cart data to all components */}
        <CartProvider>
          {/* Router enables navigation between different pages */}
          <Router>
            {/* This div is a container that holds everything */}
            <div>
              {/* Navbar appears on every page at the top */}
              <Navbar />
              {/* Main content area - everything below the navbar */}
              <main>
                {/* Routes defines all the different pages users can visit */}
                <Routes>
                  {/* Public Routes - anyone can visit these pages without logging in */}
                  {/* The path="/" means the homepage - when someone visits your website */}
                  <Route path="/" element={<HomePage />} />
                  {/* path="/products" shows the product catalog page */}
                  <Route path="/products" element={<ProductCatalog />} />
                  {/* path="/products/:id" shows details of a specific product */}
                  {/* The :id part means it's a variable - like /products/123 */}
                  <Route path="/products/:id" element={<ProductDetails />} />
                  {/* Login page for existing users */}
                  <Route path="/login" element={<Login />} />
                  {/* Registration page for new users */}
                  <Route path="/register" element={<Register />} />
                  {/* About page with company information */}
                  <Route path="/about" element={<About />} />
                  {/* Contact page with contact form */}
                  <Route path="/contact" element={<Contact />} />
                  
                  {/* Protected Routes - users must be logged in to see these pages */}
                  {/* ProtectedRoute is a wrapper that checks if user is logged in */}
                  {/* If not logged in, it redirects to login page */}
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  } />
                  {/* Shopping cart - only logged in users can see */}
                  <Route path="/cart" element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  } />
                  {/* Order history - only logged in users can see */}
                  <Route path="/orders" element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  } />
                  {/* Specific order details - only logged in users can see */}
                  <Route path="/orders/:id" element={
                    <ProtectedRoute>
                      <OrderDetails />
                    </ProtectedRoute>
                  } />
                  {/* Wishlist - only logged in users can see */}
                  <Route path="/wishlist" element={
                    <ProtectedRoute>
                      <Wishlist />
                    </ProtectedRoute>
                  } />
                  {/* Notifications - only logged in users can see */}
                  <Route path="/notifications" element={
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  } />
                  
                  {/* Fallback route - if someone tries to visit a page that doesn't exist */}
                  {/* Navigate automatically redirects them to the homepage */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </Router>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
}

// This exports the App function so other files can use it
// It's like making the App function available to the rest of the application
export default App;
