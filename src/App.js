import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingTrophy from './components/FloatingTrophy';
import AIChatbot from './components/AIChatbot';

// Wrapper component to conditionally show Navbar
const ConditionalNavbar = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  
  // Don't show navbar on dashboard
  if (isDashboard) return null;
  
  return <Navbar />;
};

// Wrapper component to conditionally show Footer
const ConditionalFooter = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  
  // Don't show footer on dashboard
  if (isDashboard) return null;
  
  return <Footer />;
};

// Wrapper component to conditionally show chatbot
const ConditionalChatbot = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  
  // Don't show chatbot on dashboard (it's in the hamburger menu there)
  if (isDashboard) return null;
  
  return <AIChatbot />;
};

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Team = lazy(() => import('./pages/Team'));
const Sponsors = lazy(() => import('./pages/Sponsors'));
const Events = lazy(() => import('./pages/Events'));
const Contests = lazy(() => import('./pages/Contests'));
const SignIn = lazy(() => import('./pages/SignIn'));
const PaymentCallback = lazy(() => import('./pages/PaymentCallback'));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-dark-bg">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vortex-blue"></div>
      <p className="mt-4 text-white/60">Loading...</p>
    </div>
  </div>
);

// Component to handle root route logic
const RootRoute = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user ? <Navigate to="/dashboard" replace /> : <Home />;
};

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-dark-bg">
        <ConditionalNavbar />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<RootRoute />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/team" element={<Team />} />
            <Route path="/sponsors" element={<Sponsors />} />
            <Route path="/events" element={<Events />} />
            <Route path="/contests" element={<Contests />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/payment-callback" element={<PaymentCallback />} />
          </Routes>
        </Suspense>
        <ConditionalFooter />
        <FloatingTrophy />
        <ConditionalChatbot />
      </div>
    </Router>
  );
}

export default App;