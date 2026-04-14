import React, { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingTrophy from './components/FloatingTrophy';
import AIChatbot from './components/AIChatbot';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';

const ConditionalNavbar = () => {
  const location = useLocation();
  if (location.pathname === '/dashboard') return null;
  return <Navbar />;
};

const ConditionalFooter = () => {
  const location = useLocation();
  if (location.pathname === '/dashboard') return null;
  return <Footer />;
};

const ConditionalChatbot = () => {
  const location = useLocation();
  if (location.pathname === '/dashboard') return null;
  return <AIChatbot />;
};

// Offline banner — shown when device loses internet
const OfflineBanner = () => {
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  if (!offline) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white text-center text-sm py-2 px-4 font-semibold">
      ⚠️ No internet connection — please check your network and try again
    </div>
  );
};

const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Team = lazy(() => import('./pages/Team'));
const Sponsors = lazy(() => import('./pages/Sponsors'));
const Events = lazy(() => import('./pages/Events'));
const Contests = lazy(() => import('./pages/Contests'));
const SignIn = lazy(() => import('./pages/SignIn'));
const PaymentCallback = lazy(() => import('./pages/PaymentCallback'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-dark-bg">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vortex-blue"></div>
      <p className="mt-4 text-white/60">Loading...</p>
    </div>
  </div>
);

const RootRoute = () => {
  // Check both storages (localStorage = remember me, sessionStorage = session only)
  const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');
  return user ? <Navigate to="/dashboard" replace /> : <Home />;
};

// Scroll progress bar + scroll reveal (mobile-safe)
const ScrollEffects = () => {
  useEffect(() => {
    // Scroll progress bar
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);

    // Cursor glow — desktop only, skip on touch devices
    let glow = null;
    const isDesktop = window.matchMedia('(pointer: fine) and (min-width: 768px)').matches;
    if (isDesktop) {
      glow = document.createElement('div');
      glow.className = 'cursor-glow';
      document.body.appendChild(glow);
    }

    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      bar.style.width = `${Math.min((window.scrollY / total) * 100, 100)}%`;
    };

    const onMouseMove = (e) => {
      if (glow) {
        glow.style.left = `${e.clientX}px`;
        glow.style.top = `${e.clientY}px`;
      }
    };

    // Scroll reveal — observe existing + future elements via MutationObserver
    const revealSelector = '.reveal, .reveal-left, .reveal-right, .reveal-scale';

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    const observeAll = () => {
      document.querySelectorAll(revealSelector).forEach(el => {
        if (!el.classList.contains('is-visible')) revealObserver.observe(el);
      });
    };

    // Watch for new elements added to DOM (lazy-loaded pages)
    const mutationObserver = new MutationObserver(observeAll);
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    observeAll(); // observe existing elements immediately

    window.addEventListener('scroll', onScroll, { passive: true });
    if (isDesktop) window.addEventListener('mousemove', onMouseMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (isDesktop) window.removeEventListener('mousemove', onMouseMove);
      bar.remove();
      glow?.remove();
      revealObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
  return null;
};

function App() {
  return (
    <ThemeProvider>
    <ErrorBoundary>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-dark-bg">
          <ScrollEffects />
          <OfflineBanner />
          <ConditionalNavbar />
          <ErrorBoundary>
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
          </ErrorBoundary>
          <ConditionalFooter />
          <FloatingTrophy />
          <ConditionalChatbot />
        </div>
      </Router>
    </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
