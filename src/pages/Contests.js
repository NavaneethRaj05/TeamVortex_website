import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Clock, X, Users, Zap } from 'lucide-react';
import API_BASE_URL from '../apiConfig';
import RegistrationForm from '../components/RegistrationForm';
import PaymentFlow from '../components/PaymentFlow';

const Contests = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeContestTab, setActiveContestTab] = useState('overview');
  const [submitting, setSubmitting] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [showingPayment, setShowingPayment] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [lastSubmittedEmail, setLastSubmittedEmail] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetchEvents(controller.signal);
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

      const res = await fetch(`${API_BASE_URL}/api/events/${selectedEvent._id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });

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
                      onClick={() => setSelectedEvent(event)}
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !submitting && setSelectedEvent(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl glass-card p-8 border-t-4 border-vortex-blue max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 text-white/40 hover:text-white"
              >
                <X size={24} />
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
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Event Information */}
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Event Information</h2>
                      <p className="text-vortex-blue mb-2 font-medium">{selectedEvent.title}</p>
                    </div>

                    {/* Event Details Tabs */}
                    <div>
                      <div className="flex bg-white/5 p-1 rounded-xl overflow-x-auto scrollbar-hide mb-4">
                        {['overview', 'fees', 'rules', 'prizes'].map(tab => (
                          <button
                            key={tab}
                            onClick={() => setActiveContestTab(tab)}
                            className={`px-3 py-2 rounded-lg font-medium capitalize transition-all whitespace-nowrap text-xs ${activeContestTab === tab ? 'bg-vortex-blue text-black shadow-lg' : 'text-white/70 hover:text-white'
                              }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>

                      <div className="p-4 bg-white/5 rounded-xl border border-white/10 h-64 overflow-y-auto custom-scrollbar">
                        {activeContestTab === 'overview' && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-white/40 uppercase tracking-wider block">Date & Time</span>
                                <div className="text-white font-medium">{new Date(selectedEvent.date).toLocaleDateString()}</div>
                                <div className="text-white/70">{selectedEvent.startTime || 'TBA'}</div>
                              </div>
                              <div>
                                <span className="text-white/40 uppercase tracking-wider block">Location</span>
                                <div className="text-white font-medium">{selectedEvent.location || 'TBA'}</div>
                              </div>
                              <div>
                                <span className="text-white/40 uppercase tracking-wider block">Type</span>
                                <div className="text-white font-medium">{selectedEvent.eventType}</div>
                              </div>
                              <div>
                                <span className="text-white/40 uppercase tracking-wider block">Category</span>
                                <div className="text-white font-medium">{selectedEvent.category}</div>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-white/10">
                              <span className="text-white/40 uppercase tracking-wider text-xs block mb-2">Description</span>
                              <p className="text-white/70 text-sm leading-relaxed">{selectedEvent.description}</p>
                            </div>

                            {/* Team Size Info */}
                            <div className="pt-3 border-t border-white/10">
                              <span className="text-white/40 uppercase tracking-wider text-xs block mb-2">Participation</span>
                              <div className="flex flex-wrap gap-2">
                                <span className="text-[10px] bg-vortex-blue/10 text-vortex-blue px-2 py-1 rounded-full border border-vortex-blue/20 font-bold">
                                  {selectedEvent.registrationType}
                                </span>
                                {selectedEvent.registrationType === 'Team' && (
                                  <span className="text-[10px] bg-white/5 text-white/60 px-2 py-1 rounded-full border border-white/10 font-bold">
                                    {selectedEvent.minTeamSize === selectedEvent.maxTeamSize
                                      ? `${selectedEvent.maxTeamSize} Members`
                                      : `${selectedEvent.minTeamSize}-${selectedEvent.maxTeamSize} Members`}
                                  </span>
                                )}
                                <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-1 rounded-full border border-green-500/20 font-bold">
                                  {selectedEvent.capacity > 0 ? `${selectedEvent.capacity} Spots` : 'Unlimited'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeContestTab === 'fees' && (
                          <div className="space-y-4">
                            {selectedEvent.price > 0 ? (
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-white/70">Registration Fee</span>
                                  <span className="text-white font-bold">₹{selectedEvent.price}</span>
                                </div>

                                {selectedEvent.gstEnabled && (
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/50">GST ({selectedEvent.gstPercent}%)</span>
                                    <span className="text-white/70">₹{Math.round(selectedEvent.price * (selectedEvent.gstPercent / 100))}</span>
                                  </div>
                                )}

                                <div className="border-t border-white/10 pt-2 flex justify-between items-center font-bold">
                                  <span className="text-white">Total</span>
                                  <span className="text-green-400 text-lg">
                                    ₹{selectedEvent.gstEnabled ?
                                      Math.round(selectedEvent.price * (1 + selectedEvent.gstPercent / 100)) :
                                      selectedEvent.price}
                                  </span>
                                </div>

                                {/* Payment Methods */}
                                <div className="pt-3 border-t border-white/10">
                                  <span className="text-white/40 uppercase tracking-wider text-xs block mb-2">Payment Options</span>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedEvent.paymentGateway === 'UPI' && (
                                      <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full">UPI Only</span>
                                    )}
                                    {selectedEvent.paymentGateway === 'Offline' && (
                                      <span className="text-[10px] bg-orange-500/10 text-orange-400 px-2 py-1 rounded-full">Offline Only</span>
                                    )}
                                    {selectedEvent.paymentGateway === 'Both' && (
                                      <>
                                        <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full">UPI</span>
                                        <span className="text-[10px] bg-orange-500/10 text-orange-400 px-2 py-1 rounded-full">Offline</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <div className="text-green-400 text-4xl mb-2">🎉</div>
                                <div className="text-green-400 font-bold text-lg">FREE EVENT</div>
                                <div className="text-white/60 text-sm">No registration fee required</div>
                              </div>
                            )}
                          </div>
                        )}

                        {activeContestTab === 'rules' && (
                          <div className="space-y-4">
                            {selectedEvent.rules ? (
                              <div>
                                <span className="text-white/40 uppercase tracking-wider text-xs block mb-2">Event Rules</span>
                                <div className="text-white/70 text-xs whitespace-pre-line leading-relaxed">
                                  {selectedEvent.rules}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <div className="text-white/20 text-4xl mb-2">📋</div>
                                <div className="text-white/40 text-sm">Rules will be shared before the event</div>
                              </div>
                            )}

                            {/* Required Documents */}
                            {selectedEvent.eligibility?.requiredDocs?.length > 0 && (
                              <div className="pt-3 border-t border-white/10">
                                <span className="text-white/40 uppercase tracking-wider text-xs block mb-2">Required Documents</span>
                                <div className="flex flex-wrap gap-2">
                                  {selectedEvent.eligibility.requiredDocs.map(doc => (
                                    <span key={doc} className="text-[10px] bg-red-500/10 text-red-400 px-2 py-1 rounded-full border border-red-500/20">
                                      {doc}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {activeContestTab === 'prizes' && (
                          <div className="space-y-4">
                            {selectedEvent.prizes?.length > 0 ? (
                              <div>
                                <span className="text-white/40 uppercase tracking-wider text-xs block mb-3">Prize Pool</span>
                                <div className="space-y-3">
                                  {selectedEvent.prizes.map((prize, idx) => (
                                    <div key={idx} className="p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-yellow-400 font-bold text-sm">{prize.position}</span>
                                            {prize.trophy && <span className="text-[10px]">🏆</span>}
                                          </div>
                                          <div className="text-white/70 text-xs mt-1">{prize.description}</div>
                                        </div>
                                        {prize.cashAmount > 0 && (
                                          <span className="text-green-400 text-sm font-bold ml-2">₹{prize.cashAmount}</span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <div className="text-white/20 text-4xl mb-2">🏆</div>
                                <div className="text-white/40 text-sm">Prize details coming soon</div>
                              </div>
                            )}
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

                    <RegistrationForm
                      event={selectedEvent}
                      onSubmit={handleRegister}
                      submitting={submitting}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Contests;