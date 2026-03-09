import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import API_BASE_URL from '../apiConfig';
import { Link, useNavigate } from 'react-router-dom';

const SignIn = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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

    const saved = JSON.parse(localStorage.getItem('rememberedUser'));
    if (saved) {
      setFormData({
        email: saved.email || '',
        password: saved.password || ''
      });
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

      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem('rememberedUser', JSON.stringify({
          email: formData.email,
          password: formData.password
        }));
      } else {
        localStorage.removeItem('rememberedUser');
      }

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
              <div className="relative flex items-center">
                <Mail className="absolute left-3 sm:left-4 h-4 w-4 sm:h-5 sm:w-5 text-white/40 pointer-events-none z-10" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 glass-card border border-dark-border rounded-lg bg-transparent text-white text-sm sm:text-base placeholder-white/40 focus:outline-none focus:border-vortex-blue transition-colors"
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
              <div className="relative flex items-center">
                <Lock className="absolute left-3 sm:left-4 h-4 w-4 sm:h-5 sm:w-5 text-white/40 pointer-events-none z-10" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 sm:pl-12 pr-12 sm:pr-14 py-3 sm:py-3.5 glass-card border border-dark-border rounded-lg bg-transparent text-white text-sm sm:text-base placeholder-white/40 focus:outline-none focus:border-vortex-blue transition-colors"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 sm:right-4 text-white/40 hover:text-white transition-colors p-1 z-10"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <label className="flex items-center cursor-pointer group">
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-vortex-blue bg-dark-bg border-2 border-white/20 rounded focus:ring-vortex-blue focus:ring-2 cursor-pointer appearance-none checked:bg-vortex-blue checked:border-vortex-blue transition-all"
                  />
                  <svg
                    className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 text-black pointer-events-none transition-opacity ${
                      rememberMe ? 'opacity-100' : 'opacity-0'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="ml-2 text-white/70 text-sm whitespace-nowrap">Remember me</span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-vortex-blue text-sm hover:underline whitespace-nowrap flex-shrink-0"
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
              <Link to="/team" className="text-vortex-blue hover:underline font-medium">
                Join Team Vortex
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;