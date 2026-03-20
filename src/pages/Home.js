import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Rocket, Users, Award, Code, ArrowRight, Zap, Globe, Calendar, Trophy, Key, Gamepad2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ParticleBackground from '../components/ParticleBackground';
import UpcomingEventsPopup from '../components/UpcomingEventsPopup';
import API_BASE_URL from '../apiConfig';

const Home = () => {

  const [events, setEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [prayogEvent, setPrayogEvent] = useState(null);
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
      // Add cache-busting timestamp to force fresh data
      const timestamp = new Date().getTime();
      const res = await fetch(`${API_BASE_URL}/api/events/lightweight?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();

      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.error('Events data is not an array:', data);
        return;
      }

      const now = new Date();

      // Filter upcoming events
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

      // Filter ALL past events (automatic detection)
      const allPastEvents = data.filter(e => {
        if (!e || e.status === 'draft') return false;
        if (e.status === 'completed') return true;

        const eventDate = new Date(e.date);
        const eventEnd = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), 23, 59, 59);

        if (e.endTime) {
          const [h, m] = e.endTime.split(':');
          eventEnd.setHours(parseInt(h), parseInt(m), 0);
        }

        return now > eventEnd;
      }).sort((a, b) => {
        // Sort by Priority (descending) first, then Date (descending)
        if ((b.priority || 0) !== (a.priority || 0)) {
          return (b.priority || 0) - (a.priority || 0);
        }
        return new Date(b.date) - new Date(a.date);
      });

      // Set the most recent past event as featured (first in sorted array)
      const featuredEvent = allPastEvents[0] || null;
      setPrayogEvent(featuredEvent);

      // Set remaining past events for gallery (skip the featured one, limit to 4)
      const remainingPastEvents = allPastEvents.slice(1, 5);
      setPastEvents(remainingPastEvents);

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

        // Filter ALL past events for fallback
        const allPastEvents = data.filter(e => {
          if (!e || e.status === 'draft') return false;
          if (e.status === 'completed') return true;

          const eventDate = new Date(e.date);
          const eventEnd = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), 23, 59, 59);

          if (e.endTime) {
            const [h, m] = e.endTime.split(':');
            eventEnd.setHours(parseInt(h), parseInt(m), 0);
          }

          return now > eventEnd;
        }).sort((a, b) => {
          if ((b.priority || 0) !== (a.priority || 0)) {
            return (b.priority || 0) - (a.priority || 0);
          }
          return new Date(b.date) - new Date(a.date);
        });

        // Set the most recent past event as featured
        const featuredEvent = allPastEvents[0] || null;
        setPrayogEvent(featuredEvent);

        // Set remaining past events for gallery
        const remainingPastEvents = allPastEvents.slice(1, 5);
        setPastEvents(remainingPastEvents);
      } catch (fallbackErr) {
        console.error('Error fetching events (fallback):', fallbackErr);
      }
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

  const prayogFallback = useMemo(() => ({
    title: 'No Past Events Yet',
    date: 'Coming Soon',
    venue: 'Navkis College of Engineering',
    description1: 'We are excited to bring you amazing technical events! Our team is working hard to organize innovative competitions, workshops, and hackathons that will challenge your skills and expand your knowledge.',
    description2: 'Stay tuned for upcoming events. Follow us on social media and check back regularly for updates on our latest activities and competitions. Join Team Vortex and be part of the tech revolution!'
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
      description1: parts[0] || rawDesc || prayogFallback.description1,
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

      <section className="py-24 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-orbitron font-bold mb-4 tracking-wider">
              <span className="gradient-text">EVENTS GALLERY</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Explore our memories and past events. A showcase of our journey, potential, and the milestones we've achieved together.
            </p>
          </div>

          {/* Featured Past Event - Automatically shows most recent */}
          {prayogEvent && (
            <div className="glass-card overflow-hidden bg-white/5 border border-white/10 mb-8 sm:mb-12">
              <div className="p-4 sm:p-6 md:p-10">
                <div className="text-center mb-4 sm:mb-6 md:mb-8">
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-orbitron font-bold mb-2 sm:mb-3 md:mb-4 tracking-wider">
                    <span className="gradient-text">{prayogDisplay.title}</span>
                  </h3>
                  <div className="flex flex-col md:flex-row items-center justify-center gap-2 sm:gap-3 md:gap-4 text-white/60">
                    <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm">
                      {prayogDisplay.date}
                    </span>
                    <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm">
                      {prayogDisplay.venue}
                    </span>
                    {prayogEvent.priority > 0 && null}
                  </div>
                </div>

                <div className="text-white/80 max-w-4xl mx-auto leading-relaxed space-y-2 sm:space-y-3 md:space-y-4 text-justify text-sm sm:text-base">
                  <p>{prayogDisplay.description1}</p>
                  <p>{prayogDisplay.description2}</p>
                </div>

                {/* Gallery Links for PRAYOG */}
                {(prayogDisplay.images?.length > 0 || prayogDisplay.galleryDriveLink) && (
                  <div className="mt-4 sm:mt-6 md:mt-8 flex flex-wrap gap-2 sm:gap-3 md:gap-4 justify-center">
                    {prayogDisplay.images?.length > 0 && (
                      <button className="glass-button text-vortex-blue border border-vortex-blue/30 hover:bg-vortex-blue hover:text-black transition-all inline-flex items-center justify-center self-start px-6 py-2">
                        📸 View Photos ({prayogDisplay.images.length})
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </button>
                    )}
                    {prayogDisplay.galleryDriveLink && (
                      <button
                        onClick={() => window.open(prayogDisplay.galleryDriveLink, '_blank')}
                        className="glass-button text-green-400 border border-green-400/30 hover:bg-green-400 hover:text-black transition-all inline-flex items-center justify-center self-start px-6 py-2"
                      >
                        📁 Drive Gallery
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </button>
                    )}
                  </div>
                )}

                {prayogSubEvents.length > 0 && (
                  <div className="mt-4 sm:mt-6 md:mt-10">
                    <h4 className="text-lg sm:text-xl font-bold text-white/80 mb-2 sm:mb-3 md:mb-4 text-center">Sub-Events</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                      {prayogSubEvents.map((subEvent, index) => {
                        // Safety check for subEvent
                        if (!subEvent || !subEvent.title) {
                          console.warn('Invalid prayog subEvent data:', subEvent);
                          return null;
                        }

                        const IconComponent = getIconComponent(subEvent.icon);
                        return (
                          <div
                            key={`home-prayog-subevent-${subEvent.title || index}`}
                            className="p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10 text-left"
                          >
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${subEvent.color || 'from-blue-500 to-purple-500'} rounded-xl flex items-center justify-center mb-2 sm:mb-3`}>
                              <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                            </div>
                            <div className="text-xs sm:text-sm font-semibold text-white leading-tight">{subEvent.title}</div>
                            {subEvent.duration && (
                              <div className="text-[10px] sm:text-xs text-white/50 mt-0.5 sm:mt-1">{subEvent.duration}</div>
                            )}
                            {subEvent.participants && (
                              <div className="text-[9px] sm:text-[11px] text-white/40 mt-0.5 sm:mt-1 leading-tight">{subEvent.participants}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No Past Events Message */}
          {!prayogEvent && pastEvents.length === 0 && (
            <div className="glass-card p-12 text-center">
              <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Past Events Yet</h3>
              <p className="text-white/60">Events will automatically appear here once their date/time has passed.</p>
            </div>
          )}
        </div>
      </section>

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
