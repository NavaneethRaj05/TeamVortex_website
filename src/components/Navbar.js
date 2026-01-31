import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const location = useLocation();

  // Update user state whenever the route changes
  React.useEffect(() => {
    setUser(JSON.parse(localStorage.getItem('user')));
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/signin';
  };

  // Define navItems based on auth state
  const navItems = user
    ? [{ name: 'Dashboard', path: '/dashboard' }]
    : [
      { name: 'Home', path: '/' },
      { name: 'Team', path: '/team' },
      { name: 'Sponsors', path: '/sponsors' },
      { name: 'Events', path: '/events' },
      { name: 'Contests', path: '/contests' },
    ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
              <span className="text-xl font-display font-bold gradient-text">
                TEAM VORTEX
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'text-vortex-blue' : ''
                    }`}
                >
                  {item.name}
                </Link>
              ))}

              {user ? (
                <button
                  onClick={handleLogout}
                  className="glass-button text-red-400 border border-red-500/30 hover:bg-red-500/10 font-bold"
                >
                  LOGOUT
                </button>
              ) : (
                <Link
                  to="/signin"
                  className="glass-button text-vortex-blue border border-vortex-blue/30 hover:bg-vortex-blue hover:text-black font-bold"
                >
                  SIGN IN
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-xl glass-card"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-white" />
              ) : (
                <Menu className="h-6 w-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={toggleMenu} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 h-full w-80 glass-nav border-l border-white/20 p-6"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-2">
                    {user && (
                      <span className="text-white font-medium text-sm">Hi, {user.name}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <button onClick={toggleMenu} className="p-2">
                      <X className="h-6 w-6 text-white" />
                    </button>
                  </div>
                </div>

                <nav className="flex-1">
                  <ul className="space-y-4">
                    {navItems.map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.path}
                          onClick={toggleMenu}
                          className={`block text-lg font-medium py-4 px-6 rounded-xl transition-all duration-300 ${location.pathname === item.path
                            ? 'text-vortex-blue bg-vortex-blue/10 border border-vortex-blue/30'
                            : 'text-white/80 hover:text-vortex-blue hover:bg-white/5 glass-card'
                            }`}
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full text-center glass-button text-red-400 border border-red-500/30 hover:bg-red-500/10 font-bold"
                  >
                    LOGOUT
                  </button>
                ) : (
                  <Link
                    to="/signin"
                    onClick={toggleMenu}
                    className="block text-center glass-button text-vortex-blue border border-vortex-blue/30 hover:bg-vortex-blue hover:text-black font-bold"
                  >
                    SIGN IN
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;