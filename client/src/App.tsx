import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { supabase } from './supabaseClient';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/shared/LoadingSpinner';
import './components/layout/layout.css';

const Home = lazy(() => import('./pages/Home'));
const Rooms = lazy(() => import('./pages/Rooms'));
const RoomDetails = lazy(() => import('./components/rooms/RoomDetails'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const RoomManagement = lazy(() => import('./pages/admin/RoomManagement'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const Payment = lazy(() => import('./pages/Payment'));
const BookingConfirmation = lazy(() => import('./pages/BookingConfirmation'));
const Dining = lazy(() => import('./pages/Dining'));
const Spa = lazy(() => import('./pages/Spa'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Cookies = lazy(() => import('./pages/Cookies'));

// Protected Route component
const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="route-loading">
        <LoadingSpinner size="large" message="Checking access..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const location = useLocation();

  return (
    <div className="main-layout">
      <Navbar />
      <main className="main-content">
        <Suspense
          fallback={
            <div className="route-loading">
              <LoadingSpinner size="large" message="Loading page..." />
            </div>
          }
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              className="route-shell"
              initial={{ opacity: 0, y: 10, filter: 'blur(3px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(2px)' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/rooms/:id" element={<RoomDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/rooms"
                  element={
                    <ProtectedRoute requireAdmin>
                      <RoomManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/bookings"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminBookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminAnalytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payment/:roomId/:checkIn/:checkOut"
                  element={
                    <ProtectedRoute>
                      <Payment />
                    </ProtectedRoute>
                  }
                />
                <Route path="/booking-confirmation" element={<BookingConfirmation />} />
                <Route path="/dining" element={<Dining />} />
                <Route path="/spa" element={<Spa />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/cookies" element={<Cookies />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) return;

    supabase.auth.getSession().catch((error) => {
      console.error('Supabase runtime check failed:', error);
    });
  }, []);

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App; 
