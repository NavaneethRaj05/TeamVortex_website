import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Team from './pages/Team';
import Sponsors from './pages/Sponsors';
import Events from './pages/Events';
import Contests from './pages/Contests';
import SignIn from './pages/SignIn';
import Footer from './components/Footer';
import FloatingTrophy from './components/FloatingTrophy';

// Component to handle root route logic
const RootRoute = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user ? <Navigate to="/dashboard" replace /> : <Home />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-bg">
        <Navbar />
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/team" element={<Team />} />
          <Route path="/sponsors" element={<Sponsors />} />
          <Route path="/events" element={<Events />} />
          <Route path="/contests" element={<Contests />} />
          <Route path="/signin" element={<SignIn />} />
        </Routes>
        <Footer />
        <FloatingTrophy />
      </div>
    </Router>
  );
}

export default App;