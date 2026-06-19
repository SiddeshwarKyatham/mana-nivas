import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/shared/LoadingSpinner';
import './components/layout/layout.css';

const Home              = lazy(() => import('./pages/Home'));
const Rooms             = lazy(() => import('./pages/Rooms'));
const RoomDetails       = lazy(() => import('./components/rooms/RoomDetails'));
const Login             = lazy(() => import('./pages/Login'));
const Register          = lazy(() => import('./pages/Register'));
const UserDashboard     = lazy(() => import('./pages/UserDashboard'));
const AdminDashboard    = lazy(() => import('./pages/AdminDashboard'));
const RoomManagement    = lazy(() => import('./pages/admin/RoomManagement'));
const AdminBookings     = lazy(() => import('./pages/admin/AdminBookings'));
const AdminUsers        = lazy(() => import('./pages/admin/AdminUsers'));
const AdminAnalytics    = lazy(() => import('./pages/admin/AdminAnalytics'));
const Payment           = lazy(() => import('./pages/Payment'));
const BookingConfirmation = lazy(() => import('./pages/BookingConfirmation'));
const Dining            = lazy(() => import('./pages/Dining'));
const Spa               = lazy(() => import('./pages/Spa'));
const About             = lazy(() => import('./pages/About'));
const Contact           = lazy(() => import('./pages/Contact'));
const Privacy           = lazy(() => import('./pages/Privacy'));
const Terms             = lazy(() => import('./pages/Terms'));
const Cookies           = lazy(() => import('./pages/Cookies'));
const EditBookingForm   = lazy(() => import('./components/booking/EditBookingForm'));
const NotFound          = lazy(() => import('./pages/NotFound'));
const AdminLayout       = lazy(() => import('./components/layout/AdminLayout'));

// --- Guard: redirect authenticated users away from login/register ---
const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <div className="route-loading"><LoadingSpinner size="large" message="Loading..." /></div>;
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  return <>{children}</>;
};

// --- Guard: redirect unauthenticated users to login, store intended path ---
const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="route-loading"><LoadingSpinner size="large" message="Checking access..." /></div>;
  }

  if (!isAuthenticated) {
    // Save the intended path so login can redirect back
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Admin routes render WITHOUT the public Navbar/Footer shell
const ADMIN_PATHS = ['/admin'];

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const pageContent = (
    <Suspense fallback={<div className="route-loading"><LoadingSpinner size="large" message="Loading page..." /></div>}>
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
            {/* Public */}
            <Route path="/"         element={<Home />} />
            <Route path="/rooms"    element={<Rooms />} />
            <Route path="/rooms/:id" element={<RoomDetails />} />
            <Route path="/dining"   element={<Dining />} />
            <Route path="/spa"      element={<Spa />} />
            <Route path="/about"    element={<About />} />
            <Route path="/contact"  element={<Contact />} />
            <Route path="/privacy"  element={<Privacy />} />
            <Route path="/terms"    element={<Terms />} />
            <Route path="/cookies"  element={<Cookies />} />

            {/* Auth — redirect away if already logged in */}
            <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

            {/* Protected user routes */}
            <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
            <Route path="/payment/:roomId/:checkIn/:checkOut" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
            <Route path="/booking-confirmation" element={<ProtectedRoute><BookingConfirmation /></ProtectedRoute>} />
            <Route path="/edit-booking/:bookingId" element={<ProtectedRoute><EditBookingForm /></ProtectedRoute>} />

            {/* Protected admin routes wrapped in AdminLayout */}
            <Route element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
              <Route path="/admin"           element={<AdminDashboard />} />
              <Route path="/admin/rooms"     element={<RoomManagement />} />
              <Route path="/admin/bookings"  element={<AdminBookings />} />
              <Route path="/admin/users"     element={<AdminUsers />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </Suspense>
  );

  // Admin pages manage their own layout (sidebar, dark shell)
  if (isAdminRoute) {
    return pageContent;
  }

  return (
    <div className="main-layout">
      <Navbar />
      <main className="main-content">
        {pageContent}
      </main>
      <Footer />
    </div>
  );
};

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    const originalScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);

    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.style.scrollBehavior = originalScrollBehavior;
    }, 100);

    return () => {
      clearTimeout(timer);
      document.documentElement.style.scrollBehavior = originalScrollBehavior;
    };
  }, [pathname]);
  return null;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;
