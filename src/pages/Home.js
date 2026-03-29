import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Rocket, Users, Award, ArrowRight, Zap, Globe, Trophy, Code } from 'lucide-react';
import { Link } from 'react-router-dom';
import ParticleBackground from '../components/ParticleBackground';
import UpcomingEventsPopup from '../components/UpcomingEventsPopup';
import API_BASE_URL from '../apiConfig';

const Home = () => {

  const [events, setEvents] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchEvents();
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const timestamp = new Date().getTime();
      const res = await fetch(`${API_BASE_URL}/api/settings?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      const timestamp = new Date().getTime();
      const res = await fetch(`${API_BASE_URL}/api/events/lightweight?t=${timestamp}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) return;

      const now = new Date();
      const upcoming = data.filter(e => {
        if (!e || e.status === 'draft' || e.status === 'completed') return false;
        const eventDate = new Date(e.date);
        const eventEnd = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), 23, 59, 59);
        if (e.endTime) {
          const [h, m] = e.endTime.split(':');
          eventEnd.setHours(parseInt(h), parseInt(m), 0);
        }
        return now <= eventEnd;
      });
      setEvents(upcoming);

      const popupShown = sessionStorage.getItem('upcomingEventsPopupShown');
      if (!popupShown && upcoming.length > 0) setShowPopup(true);
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  }, []);

  const closePopup = () => {
    setShowPopup(false);
    sessionStorage.setItem('upcomingEventsPopupShown', 'true');
  };

  const container = useMemo(() => ({
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }), []);

  const item = useMemo(() => ({
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60, damping: 15 } }
  }), []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleBackground />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="text-left z-10"
          >
            <motion.h1 variants={item} className="text-5xl sm:text-6xl md:text-8xl font-display font-bold leading-tight mb-6">
              TEAM <br />
              <span className="gradient-text text-glow">VORTEX</span>
            </motion.h1>

            <motion.p variants={item} className="text-lg sm:text-xl text-white/60 mb-8 max-w-lg leading-relaxed">
              We are a collective of innovators, developers, and creators spinning ideas into reality.
              Join the revolution of technical excellence.
            </motion.p>

            <motion.div variants={item} className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-16 sm:mb-0">
              <Link
                to="/team"
                className="glass-button group flex items-center justify-center gap-2 sm:gap-3 text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-bold rounded-xl bg-gradient-to-r from-vortex-blue to-blue-600 hover:from-vortex-blue/90 hover:to-blue-600/90 shadow-lg hover:shadow-vortex-blue/50 transition-all"
              >
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Meet the Team</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/contests"
                className="glass-button group flex items-center justify-center gap-2 sm:gap-3 text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-bold rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>View Contests</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Abstract 3D Representation (Right Side) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="hidden lg:flex justify-center relative"
          >
            <div className="relative w-96 h-96 floating-element">
              <div className="absolute inset-0 bg-vortex-blue/20 rounded-full blur-[100px]"></div>
              <div className="absolute inset-0 border-2 border-dashed border-vortex-blue/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
              <div className="absolute inset-4 border-2 border-dotted border-vortex-orange/30 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Rocket className="w-32 h-32 text-white opacity-80 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
              </div>
            </div>
          </motion.div>

        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30"
        >
          <div className="w-6 h-10 border-2 border-current rounded-full flex justify-center p-1">
            <div className="w-1 h-3 bg-current rounded-full"></div>
          </div>
        </motion.div>
      </section>

      {/* Association Logos Slider — only shown when logo count meets the minimum */}
      {(() => {
        const logos = settings?.associationLogos || [];
        const minRequired = settings?.associationSliderMinLogos ?? 3;
        if (logos.length < minRequired) return null;
        return (
        <section className="relative z-10 overflow-hidden">
          {/* Top divider with glow */}
          <div className="h-px bg-gradient-to-r from-transparent via-vortex-blue/40 to-transparent" />

          <div className="py-12 sm:py-20 bg-gradient-to-b from-black/80 via-black/60 to-black/80 backdrop-blur-md">
            <p className="text-center text-sm sm:text-base font-bold tracking-[0.25em] sm:tracking-[0.3em] text-white/60 uppercase mb-8 sm:mb-14 px-4">
              {settings?.associationSliderTitle || 'In Association With'}
            </p>

            <div className="relative overflow-hidden">
              {/* Fade edges — narrower on mobile */}
              <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-32 z-10 bg-gradient-to-r from-black to-transparent pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-10 sm:w-32 z-10 bg-gradient-to-l from-black to-transparent pointer-events-none" />

              <div className="logo-slider-wrapper">
                {/* First set */}
                <div className="logo-slider-set">
                  {logos.map((logo, idx) => (
                    <div key={idx} className="flex flex-col items-center justify-center flex-shrink-0 px-5 sm:px-16">
                      <div className="h-16 w-32 sm:h-24 sm:w-48 flex items-center justify-center p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 hover:border-vortex-blue/40 hover:bg-white/10 transition-all duration-300">
                        <img
                          src={logo.url}
                          alt={logo.label || `Partner ${idx + 1}`}
                          className="max-h-10 sm:max-h-16 max-w-[6rem] sm:max-w-[9rem] w-auto object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
                          onError={e => { e.target.parentElement.parentElement.style.display = 'none'; }}
                        />
                      </div>
                      {logo.label && (
                        <span className="text-[10px] sm:text-[11px] text-white/35 whitespace-nowrap tracking-widest uppercase mt-2 sm:mt-3">{logo.label}</span>
                      )}
                    </div>
                  ))}
                </div>
                {/* Clone — seamless loop */}
                <div className="logo-slider-set" aria-hidden="true">
                  {logos.map((logo, idx) => (
                    <div key={idx} className="flex flex-col items-center justify-center flex-shrink-0 px-5 sm:px-16">
                      <div className="h-16 w-32 sm:h-24 sm:w-48 flex items-center justify-center p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10">
                        <img
                          src={logo.url}
                          alt=""
                          className="max-h-10 sm:max-h-16 max-w-[6rem] sm:max-w-[9rem] w-auto object-contain opacity-70"
                          onError={e => { e.target.parentElement.parentElement.style.display = 'none'; }}
                        />
                      </div>
                      {logo.label && (
                        <span className="text-[10px] sm:text-[11px] text-white/35 whitespace-nowrap tracking-widest uppercase mt-2 sm:mt-3">{logo.label}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom divider with glow */}
          <div className="h-px bg-gradient-to-r from-transparent via-vortex-blue/40 to-transparent" />
          {/* Extra breathing room before stats */}
          <div className="h-10 sm:h-20 bg-gradient-to-b from-black/40 to-transparent" />
        </section>
        );
      })()}

      {/* Stats Section with Counter Effect */}
      <section className="py-20 border-y border-white/5 bg-black/80 backdrop-blur-md z-10 relative">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <StatItem number={settings?.stats?.activeMembers || "25+"} label="Active Members" icon={Users} />
          <StatItem number={settings?.stats?.projectsBuilt || "50+"} label="Projects Built" icon={Code} />
          <StatItem number={settings?.stats?.awardsWon || "12"} label="Awards Won" icon={Award} />
          <StatItem number={settings?.stats?.majorEvents || "5"} label="Major Events" icon={Globe} />
        </div>
      </section>

      {/* Vision & Mission - Bento Grid */}
      <section className="py-32 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">Our <span className="gradient-text">Core Drive</span></h2>
            <p className="text-white/60 max-w-2xl mx-auto">Fueling the future through innovation and collaboration.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Our Vision Card */}
            <motion.div
              className="bento-card relative overflow-hidden group border-vortex-blue/20 hover:border-vortex-blue/50 transition-colors"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-14 h-14 rounded-xl bg-vortex-blue/20 flex items-center justify-center mb-6 text-vortex-blue">
                  <Target className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                <p className="text-white/70 leading-relaxed">
                  {settings?.vision || "To cultivate a generation of tech leaders who don't just adapt to the future, but define it. We aim to be the epicenter of student innovation, fostering a culture where every idea has the power to spark a revolution and solve complex global challenges."}
                </p>
                <div className="mt-auto pt-6 flex items-center text-vortex-blue text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn how we innovate <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Target className="w-40 h-40" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-vortex-blue/5 to-transparent pointer-events-none"></div>
            </motion.div>

            {/* Fast Paced Card */}
            <motion.div
              className="bento-card relative overflow-hidden group border-vortex-orange/20 hover:border-vortex-orange/50 transition-colors"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-14 h-14 rounded-xl bg-vortex-orange/20 flex items-center justify-center mb-6 text-vortex-orange">
                  <Zap className="w-7 h-7" />
                </div>
                <h4 className="text-2xl font-bold mb-4">Fast Paced</h4>
                <p className="text-white/70 leading-relaxed">
                  {settings?.fastPaced || "We move fast, break things, and build them better. Our agile methodology ensures we stay ahead of technical trends and deliver cutting-edge solutions in record time."}
                </p>
                <div className="mt-auto pt-6 flex items-center text-vortex-orange text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Our development cycle <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Zap className="w-40 h-40" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-vortex-orange/5 to-transparent pointer-events-none"></div>
            </motion.div>

            {/* Global Impact Card */}
            <motion.div
              className="bento-card relative overflow-hidden group border-cyan-400/20 hover:border-cyan-400/50 transition-colors"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-14 h-14 rounded-xl bg-cyan-400/20 flex items-center justify-center mb-6 text-cyan-400">
                  <Globe className="w-7 h-7" />
                </div>
                <h4 className="text-2xl font-bold mb-4">Global Impact</h4>
                <p className="text-white/70 leading-relaxed">
                  {settings?.globalImpact || "Solving real-world problems with code. From local community tools to scalable global platforms, our projects are built with the intention of making a positive, measurable difference in society."}
                </p>
                <div className="mt-auto pt-6 flex items-center text-cyan-400 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  See our influence <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Globe className="w-40 h-40" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-transparent pointer-events-none"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Statement (Separate for emphasis) */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-1 rounded-3xl bg-gradient-to-r from-vortex-blue via-purple-500 to-vortex-orange"
          >
            <div className="bg-black/90 rounded-[22px] p-12 md:p-20">
              <Rocket className="w-16 h-16 mx-auto text-white mb-8" />
              <h2 className="text-4xl md:text-5xl font-bold font-display mb-8">Our Mission</h2>
              <p className="text-xl md:text-2xl text-white/80 leading-relaxed">
                {settings?.mission || '"To bridge the gap between academic theory and industry reality by providing an ecosystem for hands-on learning, mentorship, and competitive excellence."'}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {showPopup && (
          <UpcomingEventsPopup
            events={events}
            onClose={closePopup}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const StatItem = ({ number, label, icon: Icon }) => (
  <motion.div
    whileHover={{ y: -10 }}
    className="flex flex-col items-center group cursor-default"
  >
    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-vortex-blue/20 transition-colors">
      <Icon className="w-8 h-8 text-white/50 group-hover:text-vortex-blue transition-colors" />
    </div>
    <span className="text-4xl font-bold text-white mb-2">{number}</span>
    <span className="text-sm font-medium text-white/40 uppercase tracking-widest">{label}</span>
  </motion.div>
);

export default Home;
