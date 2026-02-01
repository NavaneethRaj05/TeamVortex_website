import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Rocket, Users, Award, Code, ArrowRight, Zap, Globe, Calendar, Trophy, Key, Gamepad2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ParticleBackground from '../components/ParticleBackground';
import UpcomingEventsPopup from '../components/UpcomingEventsPopup';
import API_BASE_URL from '../apiConfig';

const Home = () => {

  const [events, setEvents] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [prayogEvent, setPrayogEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // Use lightweight endpoint for faster loading
      const res = await fetch(`${API_BASE_URL}/api/events/lightweight`);
      const data = await res.json();

      const prayog = data.find(e => (e.title || '').trim().toLowerCase() === 'prayog 1.0');
      setPrayogEvent(prayog || null);

      const upcoming = data.filter(e => {
        if (e.status === 'draft' || e.status === 'completed') return false;
        const eventDate = new Date(e.date);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return eventDate >= now;
      });
      setEvents(upcoming);

      // Check session storage to show popup only once per session
      const popupShown = sessionStorage.getItem('upcomingEventsPopupShown');
      if (!popupShown && upcoming.length > 0) {
        setShowPopup(true);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      // Fallback to regular endpoint
      try {
        const res = await fetch(`${API_BASE_URL}/api/events`);
        const data = await res.json();
        const prayog = data.find(e => (e.title || '').trim().toLowerCase() === 'prayog 1.0');
        setPrayogEvent(prayog || null);
        const upcoming = data.filter(e => {
          if (e.status === 'draft' || e.status === 'completed') return false;
          const eventDate = new Date(e.date);
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          return eventDate >= now;
        });
        setEvents(upcoming);
      } catch (fallbackErr) {
        console.error('Error fetching events (fallback):', fallbackErr);
      }
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    sessionStorage.setItem('upcomingEventsPopupShown', 'true');
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
  };

  const prayogFallback = useMemo(() => ({
    title: 'PRAYOG 1.0',
    date: 'March 25, 2025',
    venue: 'Navkis College of Engineering',
    description1: 'Prayog 1.0 was a flagship technical event organized by Team Vortex at Navkis College of Engineering, Hassan, held on 25th March 2025. Designed to foster innovation, collaboration, and tech-oriented problem-solving, Prayog 1.0 showcased the club\'s commitment to hands-on learning and student engagement through its four key sub-events.',
    description2: 'The event drew over 150 participants, reflecting strong interest across disciplines. Prayog 1.0 not only provided a platform for skill development and networking but also celebrated the diversity and enthusiasm of the tech community at Navkis College of Engineering. The success and energetic response to Prayog 1.0 have laid a strong foundation for it to become a recurring highlight in the annual calendar of Team Vortex.'
  }), []);

  const prayogDisplay = useMemo(() => {
    if (!prayogEvent) return prayogFallback;

    const eventDateStr = prayogEvent.date
      ? new Date(prayogEvent.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : prayogFallback.date;

    const venueStr = (prayogEvent.location || '').trim() || prayogFallback.venue;

    const rawDesc = (prayogEvent.description || '').trim();
    const parts = rawDesc
      ? rawDesc.split(/\n\s*\n+/g).map(p => p.trim()).filter(Boolean)
      : [];

    return {
      title: (prayogEvent.title || '').trim() || prayogFallback.title,
      date: eventDateStr,
      venue: venueStr,
      description1: parts[0] || prayogFallback.description1,
      description2: parts[1] || prayogFallback.description2
    };
  }, [prayogEvent, prayogFallback]);

  const prayogSubEventsFallback = useMemo(() => ([
    {
      title: 'Champions League',
      description: 'Branch-wise competitive event where teams represented their respective departments.',
      details: 'Champions League was a branch-wise competitive event where teams represented their respective departments. It focused on testing participants\' technical knowledge, logical thinking, and teamwork through multiple challenging rounds, fostering healthy competition among branches.',
      icon: 'Trophy',
      color: 'from-yellow-500 to-orange-500',
      duration: 'Full Day',
      participants: 'Branch-wise Teams'
    },
    {
      title: 'Hackathon',
      description: 'Inter-college team-based coding and innovation challenge.',
      details: 'The Hackathon was an inter-college team-based coding and innovation challenge. Teams worked intensively to develop practical solutions to real-world problems within a limited time. This event emphasized innovation, problem-solving, coding skills, and collaboration.',
      icon: 'Code',
      color: 'from-vortex-blue to-cyan-400',
      duration: 'Full Day',
      participants: 'Inter-College Teams'
    },
    {
      title: 'Eureka',
      description: 'Idea and innovation-based event conducted within the college.',
      details: 'Eureka was an idea and innovation-based event conducted within the college. Teams presented creative solutions and project ideas to real-world or technical problems, focusing on original thinking, feasibility, and impact.',
      icon: 'Key',
      color: 'from-purple-500 to-pink-500',
      duration: 'Half Day',
      participants: 'Intra-College Teams'
    },
    {
      title: 'Gameathon',
      description: 'Fun yet competitive intra-college event centered around strategic games.',
      details: 'Gameathon was a fun yet competitive intra-college event centered around strategic and skill-based games. It tested participants\' decision-making, coordination, and analytical skills, making it both engaging and intellectually stimulating.',
      icon: 'Gamepad2',
      color: 'from-red-500 to-vortex-orange',
      duration: 'Half Day',
      participants: 'Intra-College Teams'
    }
  ]), []);

  const prayogSubEvents = useMemo(() => {
    if (prayogEvent?.subEvents?.length > 0) return prayogEvent.subEvents;
    return prayogSubEventsFallback;
  }, [prayogEvent, prayogSubEventsFallback]);

  const getIconComponent = useMemo(() => (iconName) => {
    const icons = { Trophy, Code, Key, Gamepad2, Users };
    return icons[iconName] || Calendar;
  }, []);

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
            <motion.div variants={item} className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1 mb-6 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-sm font-medium text-white/80">Recruitment Open 2026</span>
            </motion.div>

            <motion.h1 variants={item} className="text-5xl sm:text-6xl md:text-8xl font-display font-bold leading-tight mb-6">
              TEAM <br />
              <span className="gradient-text text-glow">VORTEX</span>
            </motion.h1>

            <motion.p variants={item} className="text-lg sm:text-xl text-white/60 mb-8 max-w-lg leading-relaxed">
              We are a collective of innovators, developers, and creators spinning ideas into reality.
              Join the revolution of technical excellence.
            </motion.p>

            <motion.div variants={item} className="flex flex-col sm:flex-row gap-4">
              <Link to="/team" className="glass-button group flex items-center justify-center space-x-2 text-white">
                <span>Meet the Team</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/contests" className="px-8 py-4 rounded-xl font-bold border border-white/10 hover:bg-white/5 text-white/70 hover:text-white transition-all text-center">
                View Contests
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

      <section className="py-24 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="glass-card overflow-hidden bg-white/5 border border-white/10">
            <div className="p-10">
              <div className="text-center mb-8">
                <h2 className="text-4xl md:text-6xl font-orbitron font-bold mb-4 tracking-wider">
                  <span className="gradient-text">{prayogDisplay.title}</span>
                </h2>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-white/60">
                  <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm">
                    {prayogDisplay.date}
                  </span>
                  <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm">
                    {prayogDisplay.venue}
                  </span>
                </div>
              </div>

              <div className="text-white/80 max-w-4xl mx-auto leading-relaxed space-y-4 text-justify">
                <p>{prayogDisplay.description1}</p>
                <p>{prayogDisplay.description2}</p>
              </div>

              {prayogSubEvents.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-xl font-bold text-white/80 mb-4 text-center">Sub-Events</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {prayogSubEvents.map((subEvent, index) => {
                      const IconComponent = getIconComponent(subEvent.icon);
                      return (
                        <div
                          key={`home-prayog-subevent-${subEvent.title || index}`}
                          className="p-4 bg-white/5 rounded-xl border border-white/10 text-left"
                        >
                          <div className={`w-10 h-10 bg-gradient-to-br ${subEvent.color || 'from-blue-500 to-purple-500'} rounded-xl flex items-center justify-center mb-3`}>
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <div className="text-sm font-semibold text-white">{subEvent.title}</div>
                          {subEvent.duration && (
                            <div className="text-xs text-white/50 mt-1">{subEvent.duration}</div>
                          )}
                          {subEvent.participants && (
                            <div className="text-[11px] text-white/40 mt-1">{subEvent.participants}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Counter Effect */}
      <section className="py-20 border-y border-white/5 bg-black/80 backdrop-blur-md z-10 relative">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <StatItem number="25+" label="Active Members" icon={Users} />
          <StatItem number="50+" label="Projects Built" icon={Code} />
          <StatItem number="12" label="Awards Won" icon={Award} />
          <StatItem number="5" label="Major Events" icon={Globe} />
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
                  To cultivate a generation of tech leaders who don't just adapt to the future,
                  but define it. We aim to be the epicenter of student innovation,
                  fostering a culture where every idea has the power to spark a revolution
                  and solve complex global challenges.
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
                  We move fast, break things, and build them better. Our agile methodology
                  ensures we stay ahead of technical trends and deliver cutting-edge
                  solutions in record time.
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
                  Solving real-world problems with code. From local community tools to
                  scalable global platforms, our projects are built with the intention
                  of making a positive, measurable difference in society.
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
                "To bridge the gap between academic theory and industry reality by providing
                an ecosystem for hands-on learning, mentorship, and competitive excellence."
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
