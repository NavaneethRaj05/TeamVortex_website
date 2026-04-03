import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Clock, X, Users, Zap } from 'lucide-react';
import API_BASE_URL from '../apiConfig';

// Lazy load heavy components — only downloaded when user opens registration modal
const RegistrationForm = lazy(() => import('../components/RegistrationForm'));
const PaymentFlow = lazy(() => import('../components/PaymentFlow'));

const Contests = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loadingEventId, setLoadingEventId] = useState(null); // tracks which card is loading full data
  const [activeContestTab, setActiveContestTab] = useState('overview');
  const [submitting, setSubmitting] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [showingPayment, setShowingPayment] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [lastSubmittedEmail, setLastSubmittedEmail] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetchEvents(controller.signal);
    // Pre-warm the serverless function so Register Now is instant
    fetch(`${API_BASE_URL}/api/health`).catch(() => {});
    return () => controller.abort();
  }, []);

  const fetchEvents = async (signal) => {
    try {
      // Cache-bust to always get fresh data
      const t = Date.now();
      const res = await fetch(`${API_BASE_URL}/api/events/lightweight?t=${t}`, {
        signal,
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      const data = await res.json();
      const now = new Date();

      const upcoming = data.filter(e => {
        if (e.status === 'draft' || e.status === 'completed') return false;
        // Exclude main event containers
        if (e.isMainEventContainer) return false;
        if (!e.startTime && !e.parentEventId) return false;

        const eventDate = new Date(e.date);
        const eventEnd = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), 23, 59, 59);

        if (e.endTime) {
          const [h, m] = e.endTime.split(':');
          eventEnd.setHours(parseInt(h), parseInt(m), 0);
        }

        return now <= eventEnd;
      }).sort((a, b) => new Date(a.date) - new Date(b.date));

      setEvents(upcoming);
      setLoading(false);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error fetching events:', err);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!selectedEvent) setActiveContestTab('overview');
  }, [selectedEvent]);

  // Lock body scroll when modal is open (prevents iOS page scroll behind modal)
  useEffect(() => {
    if (selectedEvent) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [selectedEvent]);

  const handleRegister = async ({ teamName, members }) => {
    setSubmitting(true);
    setLastSubmittedEmail(members[0]?.email || '');
    try {
      const registrationData = {
        teamName,
        country: 'India',
        institutionName: members[0].college,
        department: members[0].department,
        yearOfStudy: members[0].year,
        members: members.map(m => ({
          name: m.name, email: m.email, phone: m.phone,
          college: m.college, collegeType: m.collegeType,
          idNumber: m.idNumber, department: m.department, year: m.year,
          age: m.age || '',
          state: m.state, city: m.city,
          tshirtSize: m.tshirtSize, dietaryPreference: m.dietaryPreference,
          emergencyContactName: m.emergencyContactName,
          emergencyContactPhone: m.emergencyContactPhone,
          specialRequirements: m.specialRequirements,
        })),
        paid: false, paymentId: ''
      };

      let res, lastErr;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 30000); // 30s — mobile networks can be slow
          res = await fetch(`${API_BASE_URL}/api/events/${selectedEvent._id}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registrationData),
            signal: controller.signal
          });
          clearTimeout(timeout);
          break;
        } catch (fetchErr) {
          lastErr = fetchErr;
          if (fetchErr.name === 'AbortError') { lastErr = new Error('Request timed out. Please try again.'); break; }
          if (attempt < 3) await new Promise(r => setTimeout(r, attempt * 1500));
        }
      }
      if (!res) throw new Error(lastErr?.message || 'Network error. Please check your connection.');

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Please check your connection and try again.');
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (selectedEvent.price > 0) {
        try {
          const payInfoRes = await fetch(`${API_BASE_URL}/api/events/${selectedEvent._id}/payment-info`);
          const payInfoData = await payInfoRes.json();
          setPaymentInfo(payInfoData);
          setShowingPayment(true);
          setSubmitting(false);
        } catch (err) {
          setRegSuccess(true);
          setSubmitting(false);
        }
      } else {
        setRegSuccess(true);
        setSubmitting(false);
        setTimeout(() => {
          setRegSuccess(false);
          setShowingPayment(false);
          setSelectedEvent(null);
          fetchEvents();
        }, 3000);
      }
    } catch (err) {
      console.error('Registration error:', err);
      alert(err.message || 'Registration failed. Please try again.');
      setSubmitting(false);
    }
  };

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  }), []);

  return (
    <div className="pt-24 pb-12 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
            <span className="gradient-text">UPCOMING CONTESTS</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Challenge yourself and showcase your skills in our upcoming hackathons,
            coding competitions, workshops, and technical events.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card overflow-hidden animate-pulse">
                <div className="h-48 bg-white/10"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-white/10 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-white/10 rounded"></div>
                    <div className="h-3 bg-white/10 rounded"></div>
                    <div className="h-3 bg-white/10 rounded w-2/3"></div>
                  </div>
                  <div className="h-10 bg-white/10 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
          >
            {events.length > 0 ? (
              events.map((event, index) => (
                <motion.div
                  key={event._id}
                  variants={itemVariants}
                  className="glass-card overflow-hidden group hover-lift neon-border relative"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Animated Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-vortex-blue/10 via-purple-500/10 to-vortex-orange/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Event Header with Image/Gradient */}
                  <div className="h-48 bg-gradient-to-br from-vortex-blue/30 via-purple-500/30 to-vortex-orange/20 relative p-6 flex flex-col justify-end overflow-hidden">
                    {/* Animated particles effect */}
                    <div className="absolute inset-0 particle-bg opacity-50"></div>
                    
                    {/* Floating badge */}
                    <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-white border border-vortex-blue/50 pulse-glow animate-float">
                      <span className="text-glow">UPCOMING</span>
                    </div>
                    
                    {/* Event Title with glow */}
                    <h3 className="text-2xl font-bold text-white mb-2 relative z-10 text-glow group-hover:scale-105 transition-transform duration-300">
                      {event.title}
                    </h3>
                  </div>
                  
                  {/* Event Details */}
                  <div className="p-6 relative z-10">
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-white/70 text-sm hover:text-vortex-blue transition-colors">
                        <Calendar className="h-4 w-4 mr-2 text-vortex-blue animate-pulse" />
                        {new Date(event.date).toLocaleDateString(undefined, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center text-white/70 text-sm hover:text-vortex-orange transition-colors">
                        <Clock className="h-4 w-4 mr-2 text-vortex-orange" />
                        {event.startTime ? `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}` : 'Time TBA'}
                      </div>
                      <div className="flex items-center text-white/70 text-sm hover:text-green-400 transition-colors">
                        <MapPin className="h-4 w-4 mr-2 text-green-400" />
                        {event.location || 'Venue TBA'}
                      </div>
                    </div>

                    {/* Event Stats with enhanced styling */}
                    <div className="flex justify-between items-center mb-4 p-4 bg-gradient-to-r from-white/5 to-white/10 rounded-xl border border-white/10 hover:border-vortex-blue/30 transition-all duration-300 shimmer">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-white/40 font-bold tracking-wider">Price</span>
                        <span className="text-vortex-blue font-bold text-lg">{event.price > 0 ? `₹${event.price}` : 'FREE'}</span>
                      </div>
                      <div className="h-8 w-px bg-white/10"></div>
                      <div className="flex flex-col text-center">
                        <span className="text-[10px] uppercase text-white/40 font-bold tracking-wider">Registered</span>
                        <span className="text-white font-bold text-lg">{event.registrationCount || 0}</span>
                      </div>
                      <div className="h-8 w-px bg-white/10"></div>
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] uppercase text-white/40 font-bold tracking-wider">Spots Left</span>
                        <span className={`${event.capacity > 0 && (event.capacity - (event.registrationCount || 0)) <= 5 ? 'text-vortex-orange animate-pulse' : 'text-white'} font-bold text-lg`}>
                          {event.capacity > 0 ? Math.max(0, event.capacity - (event.registrationCount || 0)) : '∞'}
                        </span>
                      </div>
                    </div>

                    <p className="text-white/60 text-sm mb-6 line-clamp-3 leading-relaxed">
                      {event.description}
                    </p>
                    
                    {/* Enhanced Register Button */}
                    <button
                      onClick={async () => {
                        // Open modal immediately with lightweight data — don't make user wait
                        setSelectedEvent(event);
                        setLoadingEventId(event._id);
                        // Upgrade with full data in background (rules, prizes, faqs etc.)
                        try {
                          const full = await fetch(`${API_BASE_URL}/api/events/${event._id}`);
                          if (full.ok) {
                            const fullData = await full.json();
                            setSelectedEvent(fullData);
                          }
                        } catch {
                          // keep lightweight data — already showing
                        } finally {
                          setLoadingEventId(null);
                        }
                      }}
                      className={`w-full glass-button font-bold py-3 rounded-xl transition-all duration-300 btn-glow ripple relative overflow-hidden ${
                        event.capacity > 0 && event.registrationCount >= event.capacity
                          ? 'text-vortex-orange border-2 border-vortex-orange/50 hover:bg-vortex-orange hover:text-black hover:shadow-lg hover:shadow-vortex-orange/50'
                          : 'text-vortex-blue border-2 border-vortex-blue/50 hover:bg-vortex-blue hover:text-black hover:shadow-lg hover:shadow-vortex-blue/50'
                      }`}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {event.capacity > 0 && event.registrationCount >= event.capacity ? (
                          <>
                            <Users className="h-4 w-4" />
                            JOIN WAITLIST
                          </>
                        ) : loadingEventId === event._id ? (
                          <>
                            <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                            LOADING...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4" />
                            REGISTER NOW
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 glass-card">
                <h3 className="text-2xl font-bold text-white mb-2">No Events Scheduled</h3>
                <p className="text-white/60">Check back later for upcoming events and contests!</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Registration Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/85"
            onClick={() => !submitting && setSelectedEvent(null)}
          >
            {/* Scroll wrapper — separate from backdrop so content touches don't close modal */}
            <div
              className="absolute inset-0 overflow-y-auto"
              style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start justify-center min-h-full p-2 sm:p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl glass-card p-4 sm:p-8 border-t-4 border-vortex-blue my-2 sm:my-4"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedEvent(null)}
                className="sticky top-0 float-right z-10 w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-all touch-manipulation mb-2 -mt-1 -mr-1"
              >
                <X size={18} />
              </button>

              {regSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Registration Successful!</h3>
                  <p className="text-white/60">See you at {selectedEvent.title}.</p>
                  <div className="mt-4 p-3 bg-white/5 rounded-lg text-xs text-white/50">
                    <div>📅 {new Date(selectedEvent.date).toLocaleDateString()}</div>
                    <div>🕐 {selectedEvent.startTime}</div>
                    <div>📍 {selectedEvent.location}</div>
                  </div>
                </div>
              ) : showingPayment ? (
                <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-vortex-blue/30 border-t-vortex-blue rounded-full animate-spin" /></div>}>
                <PaymentFlow
                  eventId={selectedEvent._id}
                  eventTitle={selectedEvent.title}
                  amount={selectedEvent.price}
                  paymentInfo={paymentInfo}
                  userEmail={lastSubmittedEmail}
                  onComplete={() => {
                    setShowingPayment(false);
                    setRegSuccess(true);
                    setTimeout(() => {
                      setRegSuccess(false);
                      setSelectedEvent(null);
                      fetchEvents();
                    }, 3000);
                  }}
                  onCancel={() => setShowingPayment(false)}
                />
                </Suspense>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  {/* Left Column - Event Information */}
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Event Information</h2>
                      <p className="text-vortex-blue mb-2 font-medium">{selectedEvent.title}</p>
                      {loadingEventId === selectedEvent._id && (
                        <div className="flex items-center gap-2 text-xs text-white/40 mb-2">
                          <span className="w-3 h-3 border border-white/30 border-t-white/60 rounded-full animate-spin" />
                          Loading full details...
                        </div>
                      )}
                    </div>

                    {/* Event Details Tabs */}
                    <div>
                      <div className="flex bg-white/5 p-1 rounded-xl overflow-x-auto scrollbar-hide mb-4">
                        {['overview', 'fees', 'rules', 'prizes', 'faq'].filter(tab => {
                          if (tab === 'faq') return selectedEvent.faqs?.length > 0;
                          return true;
                        }).map(tab => (
                          <button
                            key={tab}
                            onClick={() => setActiveContestTab(tab)}
                            className={`px-3 py-2 rounded-lg font-medium capitalize transition-all whitespace-nowrap text-xs ${activeContestTab === tab ? 'bg-vortex-blue text-black shadow-lg' : 'text-white/70 hover:text-white'}`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>

                      <div className="p-4 bg-white/5 rounded-xl border border-white/10 min-h-[16rem] max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {/* ── OVERVIEW ── */}
                        {activeContestTab === 'overview' && (
                          <div className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <span className="text-white/40 uppercase tracking-wider block mb-0.5">Date</span>
                                <div className="text-white font-medium">{selectedEvent.date ? new Date(selectedEvent.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'}</div>
                              </div>
                              <div>
                                <span className="text-white/40 uppercase tracking-wider block mb-0.5">Time</span>
                                <div className="text-white font-medium">{selectedEvent.startTime ? `${selectedEvent.startTime}${selectedEvent.endTime ? ` – ${selectedEvent.endTime}` : ''}` : 'TBA'}</div>
                              </div>
                              <div>
                                <span className="text-white/40 uppercase tracking-wider block mb-0.5">Venue</span>
                                <div className="text-white font-medium">{selectedEvent.location || 'TBA'}</div>
                              </div>
                              <div>
                                <span className="text-white/40 uppercase tracking-wider block mb-0.5">Category</span>
                                <div className="text-white font-medium">{selectedEvent.category} · {selectedEvent.eventType}</div>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-white/10">
                              <span className="text-white/40 uppercase tracking-wider block mb-1">Description</span>
                              <p className="text-white/70 leading-relaxed">{selectedEvent.description}</p>
                            </div>

                            {/* Registration window */}
                            {(selectedEvent.registrationOpens || selectedEvent.registrationCloses) && (
                              <div className="pt-3 border-t border-white/10">
                                <span className="text-white/40 uppercase tracking-wider block mb-1">Registration Window</span>
                                <div className="text-white/70">
                                  {selectedEvent.registrationOpens && <div>Opens: {new Date(selectedEvent.registrationOpens).toLocaleString()}</div>}
                                  {selectedEvent.registrationCloses && <div>Closes: {new Date(selectedEvent.registrationCloses).toLocaleString()}</div>}
                                </div>
                              </div>
                            )}

                            {/* Participation */}
                            <div className="pt-3 border-t border-white/10">
                              <span className="text-white/40 uppercase tracking-wider block mb-1">Participation</span>
                              <div className="flex flex-wrap gap-1.5">
                                <span className="text-[10px] bg-vortex-blue/10 text-vortex-blue px-2 py-1 rounded-full border border-vortex-blue/20 font-bold">{selectedEvent.registrationType}</span>
                                {selectedEvent.registrationType === 'Team' && (
                                  <span className="text-[10px] bg-white/5 text-white/60 px-2 py-1 rounded-full border border-white/10 font-bold">
                                    {selectedEvent.minTeamSize === selectedEvent.maxTeamSize ? `${selectedEvent.maxTeamSize} Members` : `${selectedEvent.minTeamSize}–${selectedEvent.maxTeamSize} Members`}
                                  </span>
                                )}
                                <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-1 rounded-full border border-green-500/20 font-bold">
                                  {selectedEvent.capacity > 0 ? `${selectedEvent.capacity} Spots` : 'Unlimited'}
                                </span>
                              </div>
                            </div>

                            {/* Eligibility */}
                            {selectedEvent.eligibility && (
                              <div className="pt-3 border-t border-white/10">
                                <span className="text-white/40 uppercase tracking-wider block mb-1">Eligibility</span>
                                <div className="space-y-1 text-white/70">
                                  {selectedEvent.eligibility.participantType === 'engineering' && <div>• Engineering students only</div>}
                                  {selectedEvent.eligibility.restrictBranches && selectedEvent.eligibility.allowedBranches?.length > 0 && (
                                    <div>• Branches: {selectedEvent.eligibility.allowedBranches.join(', ')}</div>
                                  )}
                                  {selectedEvent.eligibility.restrictYears && selectedEvent.eligibility.allowedYears?.length > 0 && (
                                    <div>• Years: {selectedEvent.eligibility.allowedYears.join(', ')}</div>
                                  )}
                                  {selectedEvent.eligibility.minAge && !selectedEvent.eligibility.noAgeRestriction && (
                                    <div>• Age: {selectedEvent.eligibility.minAge}{selectedEvent.eligibility.maxAge ? `–${selectedEvent.eligibility.maxAge}` : '+'} years</div>
                                  )}
                                  {selectedEvent.eligibility.requiredDocs?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {selectedEvent.eligibility.requiredDocs.map(d => (
                                        <span key={d} className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">{d}</span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Tags */}
                            {selectedEvent.tags?.length > 0 && (
                              <div className="pt-3 border-t border-white/10">
                                <div className="flex flex-wrap gap-1.5">
                                  {selectedEvent.tags.map(t => (
                                    <span key={t} className="text-[10px] bg-white/5 text-white/50 px-2 py-0.5 rounded-full border border-white/10">#{t}</span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Organizer */}
                            {selectedEvent.organizer?.name && (
                              <div className="pt-3 border-t border-white/10">
                                <span className="text-white/40 uppercase tracking-wider block mb-1">Organizer</span>
                                <div className="text-white/70">{selectedEvent.organizer.name}</div>
                                {selectedEvent.organizer.email && <div className="text-white/50">{selectedEvent.organizer.email}</div>}
                              </div>
                            )}

                            {/* Certificates */}
                            {(selectedEvent.participationCertificate || selectedEvent.winnerCertificate) && (
                              <div className="pt-3 border-t border-white/10">
                                <span className="text-white/40 uppercase tracking-wider block mb-1">Certificates</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {selectedEvent.participationCertificate && <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20">🎓 Participation</span>}
                                  {selectedEvent.winnerCertificate && <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/20">🏆 Winner</span>}
                                </div>
                              </div>
                            )}

                            {/* Document download */}
                            {selectedEvent.documentUrl && (
                              <div className="pt-3 border-t border-white/10">
                                <a href={selectedEvent.documentUrl} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-3 py-2 bg-vortex-blue/10 border border-vortex-blue/30 rounded-lg text-vortex-blue text-xs font-bold hover:bg-vortex-blue/20 transition-all">
                                  📎 {selectedEvent.documentName || 'Download Document'}
                                </a>
                              </div>
                            )}
                          </div>
                        )}

                        {/* ── FEES ── */}
                        {activeContestTab === 'fees' && (
                          <div className="space-y-3 text-xs">
                            {selectedEvent.price > 0 ? (
                              <>
                                <div className="flex justify-between items-center">
                                  <span className="text-white/70">Registration Fee</span>
                                  <span className="text-white font-bold">₹{selectedEvent.price} {selectedEvent.feeType === 'per_team' ? '/ team' : '/ person'}</span>
                                </div>
                                {selectedEvent.earlyBirdDiscount?.enabled && (
                                  <div className="flex justify-between items-center text-green-400">
                                    <span>Early Bird ({selectedEvent.earlyBirdDiscount.discountPercent}% off)</span>
                                    <span>until {new Date(selectedEvent.earlyBirdDiscount.validUntil).toLocaleDateString()}</span>
                                  </div>
                                )}
                                {selectedEvent.gstEnabled && (
                                  <div className="flex justify-between items-center text-white/50">
                                    <span>GST ({selectedEvent.gstPercent}%)</span>
                                    <span>₹{Math.round(selectedEvent.price * (selectedEvent.gstPercent / 100))}</span>
                                  </div>
                                )}
                                <div className="border-t border-white/10 pt-2 flex justify-between items-center font-bold">
                                  <span className="text-white">Total</span>
                                  <span className="text-green-400 text-sm">₹{selectedEvent.gstEnabled ? Math.round(selectedEvent.price * (1 + selectedEvent.gstPercent / 100)) : selectedEvent.price}</span>
                                </div>
                                <div className="pt-2 border-t border-white/10">
                                  <span className="text-white/40 uppercase tracking-wider block mb-1">Payment Options</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {(selectedEvent.paymentGateway === 'UPI' || selectedEvent.paymentGateway === 'Both') && <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">UPI</span>}
                                    {(selectedEvent.paymentGateway === 'Offline' || selectedEvent.paymentGateway === 'Both') && <span className="text-[10px] bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full">Offline</span>}
                                  </div>
                                </div>
                                {selectedEvent.offlineInstructions && (
                                  <div className="pt-2 border-t border-white/10">
                                    <span className="text-white/40 uppercase tracking-wider block mb-1">Offline Instructions</span>
                                    <p className="text-white/60">{selectedEvent.offlineInstructions}</p>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-center py-8">
                                <div className="text-green-400 text-4xl mb-2">🎉</div>
                                <div className="text-green-400 font-bold text-lg">FREE EVENT</div>
                                <div className="text-white/60 text-sm">No registration fee required</div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* ── RULES ── */}
                        {activeContestTab === 'rules' && (
                          <div className="space-y-4 text-xs">
                            {selectedEvent.rules ? (
                              <div>
                                <span className="text-white/40 uppercase tracking-wider block mb-2">Event Rules</span>
                                <div className="text-white/70 whitespace-pre-line leading-relaxed">{selectedEvent.rules}</div>
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <div className="text-white/20 text-4xl mb-2">📋</div>
                                <div className="text-white/40 text-sm">Rules will be shared before the event</div>
                              </div>
                            )}
                            {selectedEvent.rulebookUrl && (
                              <div className="pt-3 border-t border-white/10">
                                <a href={selectedEvent.rulebookUrl} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-4 py-3 bg-vortex-blue/10 border border-vortex-blue/30 rounded-xl text-vortex-blue font-bold hover:bg-vortex-blue/20 transition-all">
                                  📄 Download Rulebook / PDF
                                </a>
                              </div>
                            )}
                            {/* Judging criteria */}
                            {selectedEvent.judgingCriteria?.length > 0 && (
                              <div className="pt-3 border-t border-white/10">
                                <span className="text-white/40 uppercase tracking-wider block mb-2">Judging Criteria</span>
                                <div className="space-y-1.5">
                                  {selectedEvent.judgingCriteria.map((c, i) => (
                                    <div key={i} className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                                      <span className="text-white/70">{c.name}</span>
                                      <span className="text-vortex-blue font-bold">{c.maxPoints} pts</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* Rounds */}
                            {selectedEvent.isMultiRound && selectedEvent.rounds?.length > 0 && (
                              <div className="pt-3 border-t border-white/10">
                                <span className="text-white/40 uppercase tracking-wider block mb-2">Rounds</span>
                                <div className="space-y-1.5">
                                  {selectedEvent.rounds.map((r, i) => (
                                    <div key={i} className="p-2 bg-white/5 rounded-lg">
                                      <div className="text-white font-medium">Round {r.roundNumber}: {r.name}</div>
                                      {r.date && <div className="text-white/50">{new Date(r.date).toLocaleDateString()}</div>}
                                      {r.venue && <div className="text-white/50">{r.venue}</div>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* ── PRIZES ── */}
                        {activeContestTab === 'prizes' && (
                          <div className="space-y-3 text-xs">
                            {selectedEvent.prizes?.length > 0 ? (
                              <>
                                <span className="text-white/40 uppercase tracking-wider block mb-2">Prize Pool</span>
                                {selectedEvent.prizes.map((prize, idx) => (
                                  <div key={idx} className="p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-yellow-400 font-bold">{prize.position}</span>
                                          {prize.trophy && <span>🏆</span>}
                                        </div>
                                        {prize.description && <div className="text-white/60 mt-0.5">{prize.description}</div>}
                                      </div>
                                      {prize.cashAmount > 0 && <span className="text-green-400 font-bold">₹{prize.cashAmount}</span>}
                                    </div>
                                  </div>
                                ))}
                              </>
                            ) : (
                              <div className="text-center py-8">
                                <div className="text-white/20 text-4xl mb-2">🏆</div>
                                <div className="text-white/40 text-sm">Prize details coming soon</div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* ── FAQ ── */}
                        {activeContestTab === 'faq' && (
                          <div className="space-y-3 text-xs">
                            {selectedEvent.faqs?.map((faq, i) => (
                              <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/10">
                                <div className="text-white font-semibold mb-1">Q: {faq.question}</div>
                                <div className="text-white/60 leading-relaxed">A: {faq.answer}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Registration Form */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-4">Register Now</h3>

                      {/* Capacity Warning */}
                      {selectedEvent.capacity > 0 && selectedEvent.registrationCount >= selectedEvent.capacity && (
                        <div className="mb-4 p-3 bg-vortex-orange/10 border border-vortex-orange/30 rounded-lg">
                          <div className="text-vortex-orange text-xs font-bold uppercase tracking-wider mb-1">Waitlist Registration</div>
                          <p className="text-white/70 text-xs">Event is full. You'll be added to the waitlist and notified if a spot opens.</p>
                        </div>
                      )}

                      {/* Eligibility Check */}
                      {selectedEvent.eligibility?.participants?.length > 0 && (
                        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                          <div className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">Eligibility</div>
                          <div className="flex flex-wrap gap-1">
                            {selectedEvent.eligibility.participants.map(p => (
                              <span key={p} className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <Suspense fallback={<div className="flex items-center justify-center py-8"><div className="w-6 h-6 border-2 border-vortex-blue/30 border-t-vortex-blue rounded-full animate-spin" /></div>}>
                    <RegistrationForm
                      event={selectedEvent}
                      onSubmit={handleRegister}
                      submitting={submitting}
                    />
                    </Suspense>
                  </div>
                </div>
              )}
            </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Contests;