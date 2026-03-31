import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle, X, Instagram } from 'lucide-react';
import API_BASE_URL from '../apiConfig';
import { useNavigate } from 'react-router-dom';

const INSTA_URL = 'https://www.instagram.com/vortex_nce?igsh=MXM1djkybGdwaXc5bw==';

const AuditionsModal = ({ onClose }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 20, stiffness: 260 }}
        className="relative bg-[#0d1117] border border-white/10 rounded-2xl max-w-sm w-full p-7 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors">
          <X size={16} />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-vortex-blue/10 border border-vortex-blue/20 flex items-center justify-center mb-5 mx-auto">
          <span className="text-2xl">🎯</span>
        </div>

        {/* Text */}
        <h2 className="text-white font-display font-bold text-xl text-center mb-2">
          Auditions Closed
        </h2>
        <p className="text-white/50 text-sm text-center leading-relaxed mb-1">
          Team Vortex members are selected through auditions only.
        </p>
        <p className="text-white/40 text-sm text-center leading-relaxed mb-6">
          The next audition details will be announced on our Instagram page — stay tuned!
        </p>

        {/* Instagram button */}
        <a
          href={INSTA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2.5 w-full py-3 rounded-xl font-semibold text-sm
            bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 text-white
            hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-pink-500/20"
        >
          <Instagram size={17} />
          Follow @vortex_nce on Instagram
        </a>

        <p className="text-white/20 text-[10px] text-center mt-3 break-all">{INSTA_URL}</p>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

const SignIn = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showAuditions, setShowAuditions] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Redirect if already logged in and load remembered credentials
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      navigate('/dashboard');
      return;
    }

    // Load remembered email only (never store passwords)
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || 'Login Failed');
      }

      // Success
      localStorage.setItem('user', JSON.stringify(data.user));

      // Handle Remember Me — store email only, never password
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      // Clean up old insecure storage if present
      localStorage.removeItem('rememberedUser');

      navigate('/dashboard'); // Redirect to Dashboard
    } catch (err) {
      // Better error messages
      if (err.message === 'Failed to fetch') {
        setError('Cannot connect to server. Please make sure the backend server is running on port 5001.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };



  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Please enter your email address first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Request failed');
      setSuccess(data.msg);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-4 pb-24 sm:pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Welcome Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">
            <span className="gradient-text">Welcome Back!</span>
          </h1>
          <p className="text-white/70">
            Sign in to access your Team Vortex dashboard
          </p>
        </div>

        {/* Sign In Card */}
        <div className="glass-card p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 flex items-center text-sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-3 rounded-lg mb-6 flex items-center text-sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              {success}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="flex items-center gap-2 px-3 h-14 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl focus-within:border-vortex-blue focus-within:ring-2 focus-within:ring-vortex-blue/50 transition-all">
                <Mail className="h-4 w-4 text-white/40 flex-shrink-0" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="flex-1 h-full bg-transparent text-white placeholder-white/50 focus:outline-none"
                  placeholder="teamvortexnce@gmail.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Password
              </label>
              <div className="flex items-center gap-2 px-3 h-14 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl focus-within:border-vortex-blue focus-within:ring-2 focus-within:ring-vortex-blue/50 transition-all">
                <Lock className="h-4 w-4 text-white/40 flex-shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="flex-1 h-full bg-transparent text-white placeholder-white/50 focus:outline-none"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-white/40 hover:text-white transition-colors p-1 flex-shrink-0"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="cursor-pointer"
                />
                <span className="text-white/70 text-base">Remember me</span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-vortex-blue text-base hover:text-vortex-blue/80 transition-colors whitespace-nowrap"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full glass-button bg-vortex-blue text-black font-bold py-3 hover:bg-vortex-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>



          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-white/70 text-sm">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setShowAuditions(true)}
                className="text-vortex-blue hover:underline font-medium"
              >
                Join Team Vortex
              </button>
            </p>
          </div>
        </div>
      </motion.div>

      {showAuditions && <AuditionsModal onClose={() => setShowAuditions(false)} />}
    </div>
  );
};

export default SignIn;